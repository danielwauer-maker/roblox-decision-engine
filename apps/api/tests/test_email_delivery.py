import httpx
import pytest

from app.config import get_settings
from app.services import email_delivery


class FakeAsyncClient:
    def __init__(self, actions, **_kwargs):
        self.actions = list(actions)
        self.calls = 0

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def post(self, url, **_kwargs):
        self.calls += 1
        action = self.actions.pop(0)
        if isinstance(action, Exception):
            raise action
        request = httpx.Request("POST", url)
        return httpx.Response(action[0], request=request, json=action[1])


@pytest.mark.asyncio
async def test_missing_resend_key_is_skipped(monkeypatch):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    get_settings.cache_clear()

    result = await email_delivery.send_email(
        to="customer@example.com",
        subject="Test",
        body_html="Hello",
    )

    assert result.status == "SKIPPED"
    assert result.provider_message_id is None
    assert "RESEND_API_KEY" in (result.error or "")
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_transient_resend_failure_recovers_on_retry(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "test-key")
    monkeypatch.setenv("EXTERNAL_RETRY_ATTEMPTS", "2")
    monkeypatch.setenv("EXTERNAL_RETRY_BACKOFF_SECONDS", "0")
    get_settings.cache_clear()

    fake = FakeAsyncClient([(503, {"message": "temporary"}), (200, {"id": "email_123"})])
    monkeypatch.setattr(email_delivery.httpx, "AsyncClient", lambda **kwargs: fake)

    result = await email_delivery.send_email(
        to="customer@example.com",
        subject="Test",
        body_html="Hello",
    )

    assert result.status == "SENT"
    assert result.provider_message_id == "email_123"
    assert fake.calls == 2
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_invalid_recipient_failure_is_not_retried(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "test-key")
    monkeypatch.setenv("EXTERNAL_RETRY_ATTEMPTS", "3")
    monkeypatch.setenv("EXTERNAL_RETRY_BACKOFF_SECONDS", "0")
    get_settings.cache_clear()

    fake = FakeAsyncClient([(422, {"message": "invalid recipient"})])
    monkeypatch.setattr(email_delivery.httpx, "AsyncClient", lambda **kwargs: fake)

    result = await email_delivery.send_email(
        to="invalid",
        subject="Test",
        body_html="Hello",
    )

    assert result.status == "FAILED"
    assert result.error == "Resend HTTP 422"
    assert fake.calls == 1
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_resend_timeout_exhaustion_returns_failed(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "test-key")
    monkeypatch.setenv("EXTERNAL_RETRY_ATTEMPTS", "2")
    monkeypatch.setenv("EXTERNAL_RETRY_BACKOFF_SECONDS", "0")
    get_settings.cache_clear()

    timeout = httpx.ReadTimeout("provider timeout")
    fake = FakeAsyncClient([timeout, timeout])
    monkeypatch.setattr(email_delivery.httpx, "AsyncClient", lambda **kwargs: fake)

    result = await email_delivery.send_email(
        to="customer@example.com",
        subject="Test",
        body_html="Hello",
    )

    assert result.status == "FAILED"
    assert "provider timeout" in (result.error or "")
    assert fake.calls == 2
    get_settings.cache_clear()
