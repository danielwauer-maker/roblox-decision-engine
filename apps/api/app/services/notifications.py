from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import NotificationRecord
from app.services.email_delivery import send_email


async def send_notification_once(
    session: Session,
    *,
    event_key: str,
    recipient: str,
    kind: str,
    subject: str,
    body_html: str,
    organization_id: int | None = None,
) -> NotificationRecord:
    existing = session.scalar(select(NotificationRecord).where(NotificationRecord.event_key == event_key))
    if existing:
        return existing

    record = NotificationRecord(
        organization_id=organization_id,
        recipient=recipient.strip().lower(),
        kind=kind,
        event_key=event_key,
        provider="resend",
        provider_message_id=None,
        status="PENDING",
        error=None,
        created_at=datetime.now(UTC),
        sent_at=None,
    )
    session.add(record)
    session.flush()

    result = await send_email(to=record.recipient, subject=subject, body_html=body_html)
    record.status = result.status
    record.provider_message_id = result.provider_message_id
    record.error = result.error
    if result.status == "SENT":
        record.sent_at = datetime.now(UTC)
    session.commit()
    session.refresh(record)
    return record
