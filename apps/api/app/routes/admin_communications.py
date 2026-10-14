from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.orm import Session
from typing import Annotated

from app.db import SessionLocal
from app.email_models import EmailTemplateRecord
from app.models import NotificationRecord
from app.services.email_delivery import send_email
from app.services.email_templates import template_catalog
from app.tenant_security import require_admin

router = APIRouter(prefix="/v1/admin/communications", tags=["admin-communications"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


class EmailTemplateUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=2, max_length=64)
    subject: str = Field(min_length=1, max_length=255)
    body_html: str = Field(min_length=1, max_length=30000)
    active: bool = True


class ManualEmailRequest(BaseModel):
    to: str = Field(min_length=3, max_length=254)
    subject: str = Field(min_length=1, max_length=255)
    body_html: str = Field(min_length=1, max_length=30000)


@router.get("/email-templates")
def list_email_templates(session: SessionDep, _: AdminDep):
    recent = session.scalars(
        select(NotificationRecord).order_by(desc(NotificationRecord.created_at)).limit(25)
    ).all()
    return {
        "templates": template_catalog(session),
        "recent_deliveries": [
            {
                "id": row.id,
                "recipient": row.recipient,
                "kind": row.kind,
                "status": row.status,
                "provider_message_id": row.provider_message_id,
                "error": row.error,
                "created_at": row.created_at,
                "sent_at": row.sent_at,
            }
            for row in recent
        ],
    }


@router.put("/email-templates/{template_key}")
def update_email_template(
    template_key: str,
    payload: EmailTemplateUpdate,
    session: SessionDep,
    _: AdminDep,
):
    if not template_key.replace("_", "").replace("-", "").isalnum():
        raise HTTPException(status_code=422, detail="Invalid template key")
    now = datetime.now(UTC)
    row = session.scalar(select(EmailTemplateRecord).where(EmailTemplateRecord.key == template_key))
    if row is None:
        row = EmailTemplateRecord(
            key=template_key,
            name=payload.name.strip(),
            category=payload.category.strip().lower(),
            subject=payload.subject,
            body_html=payload.body_html,
            active=payload.active,
            created_at=now,
            updated_at=now,
        )
        session.add(row)
    else:
        row.name = payload.name.strip()
        row.category = payload.category.strip().lower()
        row.subject = payload.subject
        row.body_html = payload.body_html
        row.active = payload.active
        row.updated_at = now
    session.commit()
    session.refresh(row)
    return {
        "key": row.key,
        "name": row.name,
        "category": row.category,
        "subject": row.subject,
        "body_html": row.body_html,
        "active": row.active,
        "customized": True,
        "updated_at": row.updated_at,
    }


@router.post("/email-send")
async def send_manual_email(payload: ManualEmailRequest, session: SessionDep, _: AdminDep):
    recipient = payload.to.strip().lower()
    result = await send_email(to=recipient, subject=payload.subject, body_html=payload.body_html)
    now = datetime.now(UTC)
    record = NotificationRecord(
        organization_id=None,
        recipient=recipient,
        kind="manual_admin",
        event_key=f"manual_admin:{uuid4()}",
        provider="resend",
        provider_message_id=result.provider_message_id,
        status=result.status,
        error=result.error,
        created_at=now,
        sent_at=now if result.status == "SENT" else None,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return {
        "id": record.id,
        "status": record.status,
        "provider_message_id": record.provider_message_id,
        "error": record.error,
    }
