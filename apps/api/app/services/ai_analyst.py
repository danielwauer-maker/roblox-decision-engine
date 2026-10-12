import json
from dataclasses import dataclass

import httpx

from app.config import Settings, get_settings
from app.domain.analyst import AnalystBrief, compose_brief, compose_insight
from app.domain.analyst_prompt import build_prompt_package
from app.domain.decision_engine import DecisionPriority
from app.reliability import retry_http_request


class AIAnalystError(RuntimeError):
    pass


@dataclass(slots=True)
class AnalystGenerationResult:
    brief: AnalystBrief
    mode: str
    model: str | None = None
    fallback_reason: str | None = None


FORBIDDEN_CAUSAL_PHRASES = (
    "caused by",
    "proves that",
    "proven cause",
    "definitely caused",
    "certainly caused",
    "is due to",
)


OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "executive_summary": {"type": "string"},
        "priorities": {
            "type": "array",
            "maxItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "key": {"type": "string"},
                    "summary": {"type": "string"},
                    "why_it_matters": {"type": "string"},
                },
                "required": ["key", "summary", "why_it_matters"],
                "additionalProperties": False,
            },
        },
        "data_quality_note": {"type": "string"},
    },
    "required": ["executive_summary", "priorities", "data_quality_note"],
    "additionalProperties": False,
}


def _extract_output_text(payload: dict[str, object]) -> str:
    output = payload.get("output")
    if not isinstance(output, list):
        raise AIAnalystError("Responses API returned no output list")

    for item in output:
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        content = item.get("content")
        if not isinstance(content, list):
            continue
        for part in content:
            if isinstance(part, dict) and part.get("type") == "output_text":
                text = part.get("text")
                if isinstance(text, str) and text:
                    return text
            if isinstance(part, dict) and part.get("type") == "refusal":
                raise AIAnalystError("Model refused the analyst request")

    raise AIAnalystError("Responses API returned no output_text")


def _validate_prose(text: str, *, allow_causal_claim: bool = False) -> None:
    if any(character.isdigit() for character in text):
        raise AIAnalystError("Generated prose contained an unsupported numeric value")
    if not allow_causal_claim:
        lowered = text.lower()
        if any(phrase in lowered for phrase in FORBIDDEN_CAUSAL_PHRASES):
            raise AIAnalystError("Generated prose crossed the causal-claim guardrail")


def _merge_generated_brief(
    priorities: list[DecisionPriority], generated: dict[str, object]
) -> AnalystBrief:
    executive_summary = generated.get("executive_summary")
    data_quality_note = generated.get("data_quality_note")
    generated_priorities = generated.get("priorities")
    if not isinstance(executive_summary, str) or not isinstance(data_quality_note, str):
        raise AIAnalystError("Generated analyst brief is missing required text fields")
    if not isinstance(generated_priorities, list):
        raise AIAnalystError("Generated analyst brief is missing priorities")

    _validate_prose(executive_summary)
    _validate_prose(data_quality_note)

    expected = {priority.key: priority for priority in priorities}
    generated_by_key: dict[str, dict[str, object]] = {}
    for item in generated_priorities:
        if not isinstance(item, dict):
            raise AIAnalystError("Generated priority is not an object")
        key = item.get("key")
        if not isinstance(key, str) or key not in expected or key in generated_by_key:
            raise AIAnalystError("Generated priority keys do not match the decision bundle")
        generated_by_key[key] = item

    if set(generated_by_key) != set(expected):
        raise AIAnalystError("Generated priority set does not match the decision bundle")

    insights = []
    for priority in priorities:
        generated_item = generated_by_key[priority.key]
        summary = generated_item.get("summary")
        why_it_matters = generated_item.get("why_it_matters")
        if not isinstance(summary, str) or not isinstance(why_it_matters, str):
            raise AIAnalystError("Generated priority is missing prose fields")
        _validate_prose(summary, allow_causal_claim=priority.causal_claim_allowed)
        _validate_prose(why_it_matters, allow_causal_claim=priority.causal_claim_allowed)

        insight = compose_insight(priority)
        insight.summary = summary
        insight.why_it_matters = why_it_matters
        insights.append(insight)

    return AnalystBrief(
        executive_summary=executive_summary,
        priorities=insights,
        data_quality_note=data_quality_note,
    )


async def _generate_with_openai(
    priorities: list[DecisionPriority],
    settings: Settings,
    *,
    client: httpx.AsyncClient | None = None,
) -> AnalystBrief:
    if settings.openai_api_key is None:
        raise AIAnalystError("OPENAI_API_KEY is not configured")

    package = build_prompt_package(priorities)
    instructions = (
        package.system
        + "\nDo not include digits or numeric values in generated prose; the UI renders evidence separately."
        + "\nPreserve the supplied priority keys exactly and generate one prose item per supplied priority."
    )
    body = {
        "model": settings.openai_model,
        "instructions": instructions,
        "input": package.payload_json,
        "store": False,
        "max_output_tokens": 900,
        "text": {
            "format": {
                "type": "json_schema",
                "name": "roblox_product_analyst",
                "strict": True,
                "schema": OUTPUT_SCHEMA,
            }
        },
    }
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key.get_secret_value()}",
        "Content-Type": "application/json",
    }

    owns_client = client is None
    active_client = client or httpx.AsyncClient(timeout=settings.external_request_timeout_seconds)
    try:
        async def send_request() -> httpx.Response:
            response = await active_client.post(
                f"{settings.openai_api_base_url.rstrip('/')}/responses",
                headers=headers,
                json=body,
            )
            response.raise_for_status()
            return response

        response = await retry_http_request(
            send_request,
            attempts=settings.external_retry_attempts,
            backoff_seconds=settings.external_retry_backoff_seconds,
        )
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise AIAnalystError(f"Model provider request failed after retries: {exc}") from exc
    finally:
        if owns_client:
            await active_client.aclose()

    text = _extract_output_text(payload)
    try:
        generated = json.loads(text)
    except json.JSONDecodeError as exc:
        raise AIAnalystError("Model provider returned invalid JSON") from exc
    if not isinstance(generated, dict):
        raise AIAnalystError("Model provider returned a non-object JSON payload")
    return _merge_generated_brief(priorities, generated)


async def generate_analyst_brief(
    priorities: list[DecisionPriority],
    *,
    settings: Settings | None = None,
    client: httpx.AsyncClient | None = None,
) -> AnalystGenerationResult:
    resolved = settings or get_settings()
    if not priorities:
        return AnalystGenerationResult(brief=compose_brief([]), mode="deterministic")

    if resolved.openai_api_key is None:
        return AnalystGenerationResult(
            brief=compose_brief(priorities),
            mode="deterministic",
            fallback_reason="OPENAI_API_KEY is not configured",
        )

    try:
        brief = await _generate_with_openai(priorities, resolved, client=client)
    except AIAnalystError as exc:
        return AnalystGenerationResult(
            brief=compose_brief(priorities),
            mode="deterministic_fallback",
            model=resolved.openai_model,
            fallback_reason=str(exc),
        )

    return AnalystGenerationResult(
        brief=brief,
        mode="model",
        model=resolved.openai_model,
    )
