from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.models import OrganizationRecord
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
