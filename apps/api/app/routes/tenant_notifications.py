from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.models import OrganizationRecord
from app.r16_models import NotificationPreferenceRecord
from app.services.notifications import send_notification_once
from app.tenant_security import TenantDep

router = APIRouter(prefix="/v1/lifecycle/tenant", tags=["tenant-lifecycle"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


class SyncAttention(BaseModel):
    detail: str = Field(default="Roblox analytics sync needs attention.", max_length=1000)


class NotificationPreferenceUpdate(BaseModel):
    lifecycle_email_enabled: bool


def _preference(session: Session, organization_id: int) -> NotificationPreferenceRecord:
    record = session.scalar(
        select(NotificationPreferenceRecord).where(
            NotificationPreferenceRecord.organization_id == organization_id
        )
    )
    if record:
        return record
    record = NotificationPreferenceRecord(
        organization_id=organization_id,
        lifecycle_email_enabled=True,
        updated_at=datetime.now(UTC),
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("/preferences")
def get_preferences(principal: TenantDep, session: SessionDep):
    record = _preference(session, principal.organization_id)
    return {"lifecycle_email_enabled": record.lifecycle_email_enabled}


@router.put("/preferences")
def update_preferences(
    payload: NotificationPreferenceUpdate,
    principal: TenantDep,
    session: SessionDep,
):
    record = _preference(session, principal.organization_id)
    record.lifecycle_email_enabled = payload.lifecycle_email_enabled
    record.updated_at = datetime.now(UTC)
    session.commit()
    return {"lifecycle_email_enabled": record.lifecycle_email_enabled}


@router.post("/activated")
async def workspace_activated(principal: TenantDep, session: SessionDep):
    organization = session.get(OrganizationRecord, principal.organization_id)
    if not organization:
        return {"status": "ignored"}
    record = await send_notification_once(
        session,
        event_key=f"workspace-activated:{principal.user_id}",
        recipient=principal.email,
        organization_id=principal.organization_id,
        kind="WORKSPACE_ACTIVATED",
        subject=f"Welcome to your PlayDirective workspace · {organization.name}",
        body_html=(
            f"<p>Your private workspace for <strong>{organization.name}</strong> is active.</p>"
            "<p>Next: connect one Roblox experience using a read-only Open Cloud analytics key, "
            "then run your first sync.</p>"
            f'<p><a href="{get_settings().public_origin}/app/workspace">Open PlayDirective</a></p>'
        ),
    )
    return {"status": record.status}


@router.post("/sync-attention")
async def sync_attention(payload: SyncAttention, principal: TenantDep, session: SessionDep):
    organization = session.get(OrganizationRecord, principal.organization_id)
    if not organization:
        return {"status": "ignored"}
    day_key = datetime.now(UTC).date().isoformat()
    record = await send_notification_once(
        session,
        event_key=f"sync-attention:{principal.organization_id}:{day_key}",
        recipient=principal.email,
        organization_id=principal.organization_id,
        kind="SYNC_NEEDS_ATTENTION",
        subject=f"PlayDirective sync needs attention · {organization.name}",
        body_html=(
            f"<p>Your latest Roblox analytics sync needs attention: {payload.detail}</p>"
            "<p>Check that the Universe ID is correct and that the Open Cloud key still has "
            "read-only analytics access. If you regenerated the key, save the new key in the workspace.</p>"
            f'<p><a href="{get_settings().public_origin}/app/workspace">Open the workspace</a></p>'
        ),
    )
    return {"status": record.status}
