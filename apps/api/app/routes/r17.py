from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.models import (
    OrganizationRecord,
    PilotApplicationRecord,
    PilotUserRecord,
    SubscriptionRecord,
)
from app.r17_models import ApplicationReviewRecord, PilotLifecycleRecord
from app.services.notifications import send_notification_once
from app.tenant_security import TenantDep, require_admin

router = APIRouter(prefix="/v1/r17", tags=["r17"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


class PilotExtension(BaseModel):
    days: int = Field(default=7, ge=1, le=90)


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _ensure_lifecycle(session: Session, organization_id: int) -> PilotLifecycleRecord:
    row = session.scalar(select(PilotLifecycleRecord).where(PilotLifecycleRecord.organization_id == organization_id))
    if row:
        return row
    organization = session.get(OrganizationRecord, organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    now = datetime.now(UTC)
    started_at = _aware(organization.created_at)
    ends_at = started_at + timedelta(days=30)
    expired = ends_at <= now
    row = PilotLifecycleRecord(
        organization_id=organization_id,
        status="EXPIRED" if expired else "ACTIVE",
        started_at=started_at,
        ends_at=ends_at,
        converted_at=None,
        closed_at=now if expired else None,
        updated_at=now,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _payload(row: PilotLifecycleRecord) -> dict[str, object]:
    now = datetime.now(UTC)
    started_at = _aware(row.started_at)
    ends_at = _aware(row.ends_at)
    remaining_seconds = (ends_at - now).total_seconds()
    days_remaining = max(0, int((remaining_seconds + 86399) // 86400))
    elapsed = max(0, (now.date() - started_at.date()).days)
    current_day = min(30, elapsed + 1)
    effective_status = row.status
    if effective_status == "ACTIVE" and ends_at <= now:
        effective_status = "EXPIRED"
    return {
        "status": effective_status,
        "started_at": started_at,
        "ends_at": ends_at,
        "current_day": current_day,
        "days_remaining": days_remaining,
        "converted_at": _aware(row.converted_at) if row.converted_at else None,
    }


def _mark_converted_if_paid(session: Session, organization_id: int, lifecycle: PilotLifecycleRecord) -> None:
    subscription = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization_id))
    if not subscription or subscription.plan_id == "pilot" or subscription.status not in {"active", "trialing"}:
        return
    if lifecycle.status != "CONVERTED":
        now = datetime.now(UTC)
        lifecycle.status = "CONVERTED"
        lifecycle.converted_at = now
        lifecycle.updated_at = now
        application = session.scalar(select(PilotApplicationRecord).where(PilotApplicationRecord.organization_id == organization_id))
        if application:
            review = session.scalar(select(ApplicationReviewRecord).where(ApplicationReviewRecord.application_id == application.id))
            if review:
                review.pipeline_status = "PAID"
                review.updated_at = now
        session.commit()


@router.get("/tenant/pilot")
def tenant_pilot(principal: TenantDep, session: SessionDep):
    lifecycle = _ensure_lifecycle(session, principal.organization_id)
    _mark_converted_if_paid(session, principal.organization_id, lifecycle)
    return _payload(lifecycle)


@router.post("/admin/pilot/{organization_id}/extend")
def extend_pilot(organization_id: int, payload: PilotExtension, session: SessionDep, _: AdminDep):
    organization = session.get(OrganizationRecord, organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    row = _ensure_lifecycle(session, organization_id)
    base = max(_aware(row.ends_at), datetime.now(UTC))
    row.ends_at = base + timedelta(days=payload.days)
    row.status = "ACTIVE"
    row.closed_at = None
    row.updated_at = datetime.now(UTC)
    session.commit()
    return _payload(row)


@router.get("/admin/pilots")
def admin_pilots(session: SessionDep, _: AdminDep):
    organizations = session.scalars(select(OrganizationRecord).order_by(desc(OrganizationRecord.created_at))).all()
    items = []
    for organization in organizations:
        lifecycle = session.scalar(select(PilotLifecycleRecord).where(PilotLifecycleRecord.organization_id == organization.id))
        subscription = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization.id))
        if lifecycle:
            _mark_converted_if_paid(session, organization.id, lifecycle)
        application = session.scalar(select(PilotApplicationRecord).where(PilotApplicationRecord.organization_id == organization.id))
        review = None
        if application:
            review = session.scalar(select(ApplicationReviewRecord).where(ApplicationReviewRecord.application_id == application.id))
        items.append({
            "organization_id": organization.id,
            "organization_name": organization.name,
            "active": organization.active,
            "pilot": _payload(lifecycle) if lifecycle else None,
            "plan_id": subscription.plan_id if subscription else "pilot",
            "billing_status": subscription.status if subscription else "pilot",
            "pipeline_status": review.pipeline_status if review else None,
            "internal_note": review.internal_note if review else None,
        })
    return {"count": len(items), "items": items}


@router.post("/admin/lifecycle/run")
async def run_r17_lifecycle(session: SessionDep, _: AdminDep):
    now = datetime.now(UTC)
    lifecycles = session.scalars(select(PilotLifecycleRecord).where(PilotLifecycleRecord.status == "ACTIVE")).all()
    results: list[dict[str, object]] = []
    settings = get_settings()

    for lifecycle in lifecycles:
        _mark_converted_if_paid(session, lifecycle.organization_id, lifecycle)
        if lifecycle.status == "CONVERTED":
            continue
        organization = session.get(OrganizationRecord, lifecycle.organization_id)
        owner = session.scalar(
            select(PilotUserRecord).where(
                PilotUserRecord.organization_id == lifecycle.organization_id,
                PilotUserRecord.role == "OWNER",
                PilotUserRecord.active.is_(True),
            ).order_by(PilotUserRecord.id)
        )
        if not organization or not owner:
            continue

        started_at = _aware(lifecycle.started_at)
        ends_at = _aware(lifecycle.ends_at)
        elapsed = max(0, (now.date() - started_at.date()).days)
        remaining = (ends_at.date() - now.date()).days
        milestones: list[tuple[str, str, str]] = []
        if elapsed >= 2:
            milestones.append(("day-3", "Need help connecting PlayDirective?", "Open your workspace and complete the Roblox connection if you have not already."))
        if elapsed >= 6:
            milestones.append(("day-7", "Your first PlayDirective review", "Review your first priorities, evidence and pilot progress."))
        if elapsed >= 13:
            milestones.append(("day-14", "Time to review an experiment", "Use Experiment Copilot to turn a supported priority into a bounded test."))
        if elapsed >= 20:
            milestones.append(("day-21", "Your founding pilot value check", "Review what PlayDirective has surfaced and tell us what has been useful."))
        if remaining <= 3 and remaining >= 1:
            milestones.append(("ending-soon", "Your PlayDirective pilot ends soon", f"Your founding pilot has {remaining} day{'s' if remaining != 1 else ''} remaining. Review plans in your workspace if you want to continue."))
        if remaining <= 0:
            milestones.append(("day-30", "Your PlayDirective founding pilot has ended", "Your 30-day pilot is complete. Choose a paid plan only if PlayDirective has earned a place in your workflow."))

        for key, subject, copy in milestones:
            record = await send_notification_once(
                session,
                event_key=f"r17-pilot:{key}:{organization.id}",
                recipient=owner.email,
                organization_id=organization.id,
                kind="PILOT_LIFECYCLE",
                subject=subject,
                body_html=f'<p>{copy}</p><p><a href="{settings.public_origin}/app/workspace">Open PlayDirective</a></p>',
            )
            results.append({"organization_id": organization.id, "milestone": key, "status": record.status})

        if remaining <= 0:
            lifecycle.status = "EXPIRED"
            lifecycle.closed_at = now
            lifecycle.updated_at = now
            application = session.scalar(select(PilotApplicationRecord).where(PilotApplicationRecord.organization_id == organization.id))
            if application:
                review = session.scalar(select(ApplicationReviewRecord).where(ApplicationReviewRecord.application_id == application.id))
                if review and review.pipeline_status not in {"PAID", "CHURNED"}:
                    review.pipeline_status = "EXPIRED"
                    review.updated_at = now
    session.commit()
    return {"status": "completed", "notifications": results}
