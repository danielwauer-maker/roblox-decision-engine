from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.models import (
    MetricObservationRecord,
    NotificationRecord,
    OrganizationRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
)
from app.services.decision_snapshots import build_decision_snapshot
from app.services.notifications import send_notification_once
from app.tenant_security import require_admin

router = APIRouter(prefix="/v1/lifecycle", tags=["lifecycle"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


def _period_key(now: datetime) -> str:
    iso = now.isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


@router.post("/admin/run")
async def run_lifecycle(session: SessionDep, _: AdminDep):
    settings = get_settings()
    now = datetime.now(UTC)
    week_key = _period_key(now)
    stale_before = now - timedelta(days=settings.lifecycle_stale_days)
    organizations = session.scalars(
        select(OrganizationRecord).where(OrganizationRecord.active.is_(True)).order_by(OrganizationRecord.id)
    ).all()
    results: list[dict[str, object]] = []

    for organization in organizations:
        owner = session.scalar(
            select(PilotUserRecord)
            .where(
                PilotUserRecord.organization_id == organization.id,
                PilotUserRecord.role == "OWNER",
                PilotUserRecord.active.is_(True),
            )
            .order_by(PilotUserRecord.id)
        )
        if not owner:
            continue

        connection = session.scalar(
            select(RobloxConnectionRecord)
            .where(
                RobloxConnectionRecord.organization_id == organization.id,
                RobloxConnectionRecord.active.is_(True),
            )
            .order_by(desc(RobloxConnectionRecord.updated_at))
        )
        latest_observation = session.scalar(
            select(func.max(MetricObservationRecord.observed_at)).where(
                MetricObservationRecord.organization_id == organization.id
            )
        )

        if connection and (latest_observation is None or latest_observation < stale_before):
            record = await send_notification_once(
                session,
                event_key=f"analytics-stale:{organization.id}:{week_key}",
                recipient=owner.email,
                organization_id=organization.id,
                kind="ANALYTICS_STALE",
                subject="PlayDirective needs fresh Roblox analytics",
                body_html=(
                    f"<p>{organization.name} has not produced fresh stored analytics within the configured "
                    f"{settings.lifecycle_stale_days}-day window.</p>"
                    f'<p><a href="{settings.public_origin}/app/workspace">Open the workspace and run a sync</a>.</p>'
                ),
            )
            results.append({"organization_id": organization.id, "kind": record.kind, "status": record.status})

        if connection and latest_observation is not None:
            snapshot = build_decision_snapshot(
                session,
                connection.universe_id,
                organization_id=organization.id,
            )
            priorities = evaluate_snapshot(snapshot)
            if priorities:
                record = await send_notification_once(
                    session,
                    event_key=f"weekly-brief-ready:{organization.id}:{week_key}",
                    recipient=owner.email,
                    organization_id=organization.id,
                    kind="WEEKLY_BRIEF_READY",
                    subject="Your PlayDirective Weekly Brief is ready",
                    body_html=(
                        f"<p>PlayDirective has {len(priorities)} supported decision"
                        f"{'s' if len(priorities) != 1 else ''} ready for {organization.name}.</p>"
                        f'<p><a href="{settings.public_origin}/app/workspace">Review the Weekly Brief</a>.</p>'
                    ),
                )
                results.append({"organization_id": organization.id, "kind": record.kind, "status": record.status})

    return {"status": "completed", "period": week_key, "notifications": results}


@router.get("/admin/notifications")
def list_notifications(session: SessionDep, _: AdminDep):
    rows = session.scalars(
        select(NotificationRecord).order_by(desc(NotificationRecord.created_at)).limit(200)
    ).all()
    return {
        "count": len(rows),
        "items": [
            {
                "id": row.id,
                "organization_id": row.organization_id,
                "recipient": row.recipient,
                "kind": row.kind,
                "event_key": row.event_key,
                "provider": row.provider,
                "provider_message_id": row.provider_message_id,
                "status": row.status,
                "error": row.error,
                "created_at": row.created_at,
                "sent_at": row.sent_at,
            }
            for row in rows
        ],
    }
