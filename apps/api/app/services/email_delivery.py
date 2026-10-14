from dataclasses import dataclass
from html import escape

import httpx

from app.config import get_settings
from app.reliability import retry_http_request


@dataclass(frozen=True)
class EmailResult:
    status: str
    provider_message_id: str | None = None
    error: str | None = None


def _wrap_html(title: str, body_html: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;background:#07101f;color:#eef7ff;padding:32px">
      <div style="max-width:640px;margin:0 auto">
        <div style="font-size:20px;font-weight:800">PlayDirective</div>
        <h1 style="font-size:28px">{escape(title)}</h1>
        <div style="color:#c7d5e5;line-height:1.65">{body_html}</div>
        <p style="margin-top:28px;color:#718198;font-size:12px">Decision intelligence for Roblox studios.</p>
      </div>
    </div>
    """.strip()


async def send_email(*, to: str, subject: str, body_html: str) -> EmailResult:
    settings = get_settings()
    if not settings.resend_api_key:
        return EmailResult(status="SKIPPED", error="RESEND_API_KEY is not configured")

    payload = {
        "from": settings.email_from,
        "to": [to],
        "subject": subject,
        "html": _wrap_html(subject, body_html),
    }
    try:
        async with httpx.AsyncClient(timeout=settings.external_request_timeout_seconds) as client:

            async def send_request() -> httpx.Response:
                response = await client.post(
                    "https://api.resend.com/emails",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {settings.resend_api_key.get_secret_value()}",
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
                return response

            response = await retry_http_request(
                send_request,
                attempts=settings.external_retry_attempts,
                backoff_seconds=settings.external_retry_backoff_seconds,
            )
        data = response.json()
        return EmailResult(status="SENT", provider_message_id=data.get("id"))
    except httpx.HTTPStatusError as exc:
        return EmailResult(status="FAILED", error=f"Resend HTTP {exc.response.status_code}")
    except (httpx.HTTPError, ValueError) as exc:
        return EmailResult(status="FAILED", error=str(exc)[:500])
