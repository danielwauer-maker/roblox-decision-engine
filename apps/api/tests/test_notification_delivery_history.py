from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base
from app.models import NotificationRecord
from app.services import notifications
from app.services.email_delivery import EmailResult


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


async def _send(session: Session, event_key: str):
    return await notifications.send_notification_once(
        session,
        event_key=event_key,
        recipient="Owner@Example.com",
        kind="PASSWORDLESS_LOGIN",
        subject="Sign in",
        body_html="<p>Open your sign-in link</p>",
    )


def test_failed_delivery_is_persisted_in_history(monkeypatch):
    session = _session()

    async def failed_send(**_kwargs):
        return EmailResult(status="FAILED", error="Resend HTTP 422")

    monkeypatch.setattr(notifications, "send_email", failed_send)

    import asyncio

    result = asyncio.run(_send(session, "history-failed"))
    stored = session.scalar(
        select(NotificationRecord).where(NotificationRecord.event_key == "history-failed")
    )

    assert result.id == stored.id
    assert stored.recipient == "owner@example.com"
    assert stored.status == "FAILED"
    assert stored.error == "Resend HTTP 422"
    assert stored.provider_message_id is None
    assert stored.sent_at is None


def test_successful_delivery_persists_provider_message_id(monkeypatch):
    session = _session()

    async def successful_send(**_kwargs):
        return EmailResult(status="SENT", provider_message_id="resend_message_123")

    monkeypatch.setattr(notifications, "send_email", successful_send)

    import asyncio

    asyncio.run(_send(session, "history-sent"))
    stored = session.scalar(
        select(NotificationRecord).where(NotificationRecord.event_key == "history-sent")
    )

    assert stored.status == "SENT"
    assert stored.provider_message_id == "resend_message_123"
    assert stored.error is None
    assert stored.sent_at is not None


def test_existing_event_is_not_delivered_twice(monkeypatch):
    session = _session()
    calls = 0

    async def successful_send(**_kwargs):
        nonlocal calls
        calls += 1
        return EmailResult(status="SENT", provider_message_id="resend_message_once")

    monkeypatch.setattr(notifications, "send_email", successful_send)

    import asyncio

    first = asyncio.run(_send(session, "history-idempotent"))
    second = asyncio.run(_send(session, "history-idempotent"))

    assert first.id == second.id
    assert calls == 1
