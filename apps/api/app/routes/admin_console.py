from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.models import (
    MetricObservationRecord,
    OrganizationRecord,
    PilotFeedbackRecord,
    PilotInviteRecord,
    PilotSessionRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
)
from app.services.decision_snapshots import build_decision_snapshot
from app.tenant_security import require_admin

router = APIRouter(prefix="/v1/admin", tags=["admin"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


class OrganizationStatusUpdate(BaseModel):
    active: bool


def _count(session: Session, model, *conditions) -> int:
    query = select(func.count(model.id))
    if conditions:
        query = query.where(*conditions)
    return int(session.scalar(query) or 0)


def _invite_status(invite: PilotInviteRecord, now: datetime) -> str:
    if invite.redeemed_at is not None:
        return "redeemed"
    if invite.expires_at <= now:
        return "expired"
    return "pending"


def _connection(session: Session, organization_id: int) -> RobloxConnectionRecord | None:
    return session.scalar(
        select(RobloxConnectionRecord)
        .where(
            RobloxConnectionRecord.organization_id == organization_id,
            RobloxConnectionRecord.active.is_(True),
        )
        .order_by(desc(RobloxConnectionRecord.updated_at))
    )


def _current_decisions(
    session: Session,
    organization_id: int,
    connection: RobloxConnectionRecord | None,
    observation_count: int,
) -> list[dict[str, object]]:
    if not connection or not observation_count:
        return []
    snapshot = build_decision_snapshot(
        session,
        connection.universe_id,
        organization_id=organization_id,
    )
    priorities = evaluate_snapshot(snapshot)
    return [
        {**asdict(item), "priority_score": item.priority_score}
        for item in priorities[:3]
    ]


def _studio_summary(session: Session, organization: OrganizationRecord, now: datetime) -> dict[str, object]:
    users = _count(
        session,
        PilotUserRecord,
        PilotUserRecord.organization_id == organization.id,
        PilotUserRecord.active.is_(True),
    )
    invites = session.scalars(
        select(PilotInviteRecord).where(PilotInviteRecord.organization_id == organization.id)
    ).all()
    invite_statuses = [_invite_status(invite, now) for invite in invites]
    connection = _connection(session, organization.id)
    observation_count = _count(
        session,
        MetricObservationRecord,
        MetricObservationRecord.organization_id == organization.id,
    )
    latest_observation = session.scalar(
        select(func.max(MetricObservationRecord.observed_at)).where(
            MetricObservationRecord.organization_id == organization.id
        )
    )
    latest_ingestion = session.scalar(
        select(func.max(MetricObservationRecord.ingested_at)).where(
            MetricObservationRecord.organization_id == organization.id
        )
    )
    feedback_count = _count(
        session,
        PilotFeedbackRecord,
        PilotFeedbackRecord.organization_id == organization.id,
    )
    active_sessions = _count(
        session,
        PilotSessionRecord,
        PilotSessionRecord.organization_id == organization.id,
        PilotSessionRecord.revoked_at.is_(None),
        PilotSessionRecord.expires_at > now,
    )
    decisions = _current_decisions(session, organization.id, connection, observation_count)

    if not organization.active:
        state = "disabled"
    elif not users:
        state = "invited" if "pending" in invite_statuses else "awaiting_invite"
    elif not connection:
        state = "needs_connection"
    elif not observation_count:
        state = "needs_sync"
    else:
        state = "active"

    return {
        "id": organization.id,
        "slug": organization.slug,
        "name": organization.name,
        "active": organization.active,
        "state": state,
        "created_at": organization.created_at,
        "users": users,
        "active_sessions": active_sessions,
        "invites": {
            "total": len(invites),
            "pending": invite_statuses.count("pending"),
            "redeemed": invite_statuses.count("redeemed"),
            "expired": invite_statuses.count("expired"),
        },
        "connection": None
        if not connection
        else {
            "configured": True,
            "universe_id": connection.universe_id,
            "experience_name": connection.experience_name,
            "updated_at": connection.updated_at,
        },
        "data": {
            "observation_count": observation_count,
            "latest_observation_at": latest_observation,
            "latest_ingestion_at": latest_ingestion,
        },
        "decisions": {
            "count": len(decisions),
            "items": decisions,
        },
        "feedback_count": feedback_count,
    }


@router.get("/overview")
def overview(session: SessionDep, _: AdminDep) -> dict[str, object]:
    now = datetime.now(UTC)
    organizations = session.scalars(
        select(OrganizationRecord).order_by(desc(OrganizationRecord.created_at))
    ).all()
    studios = [_studio_summary(session, organization, now) for organization in organizations]

    recent_invites = session.scalars(
        select(PilotInviteRecord).order_by(desc(PilotInviteRecord.created_at)).limit(25)
    ).all()
    recent_feedback = session.scalars(
        select(PilotFeedbackRecord).order_by(desc(PilotFeedbackRecord.created_at)).limit(25)
    ).all()
    organization_names = {organization.id: organization.name for organization in organizations}

    metric_rows = session.execute(
        select(
            MetricObservationRecord.metric,
            func.count(MetricObservationRecord.id),
            func.max(MetricObservationRecord.observed_at),
        )
        .where(MetricObservationRecord.organization_id.is_not(None))
        .group_by(MetricObservationRecord.metric)
        .order_by(desc(func.count(MetricObservationRecord.id)))
    ).all()

    return {
        "generated_at": now,
        "summary": {
            "studios_total": len(organizations),
            "studios_active": sum(1 for studio in studios if studio["state"] == "active"),
            "studios_disabled": sum(1 for studio in studios if studio["state"] == "disabled"),
            "users_total": _count(session, PilotUserRecord),
            "connections_total": _count(
                session,
                RobloxConnectionRecord,
                RobloxConnectionRecord.active.is_(True),
            ),
            "observations_total": _count(
                session,
                MetricObservationRecord,
                MetricObservationRecord.organization_id.is_not(None),
            ),
            "pending_invites": sum(
                1 for invite in recent_invites if _invite_status(invite, now) == "pending"
            ),
            "active_sessions": _count(
                session,
                PilotSessionRecord,
                PilotSessionRecord.revoked_at.is_(None),
                PilotSessionRecord.expires_at > now,
            ),
            "feedback_total": _count(
                session,
                PilotFeedbackRecord,
                PilotFeedbackRecord.organization_id.is_not(None),
            ),
        },
        "studios": studios,
        "data_transfer": [
            {
                "metric": metric,
                "observations": int(count),
                "latest_observation_at": latest,
            }
            for metric, count, latest in metric_rows
        ],
        "recent_invites": [
            {
                "id": invite.id,
                "organization_id": invite.organization_id,
                "organization_name": organization_names.get(invite.organization_id, "Unknown"),
                "email": invite.email,
                "role": invite.role,
                "status": _invite_status(invite, now),
                "expires_at": invite.expires_at,
                "redeemed_at": invite.redeemed_at,
                "created_at": invite.created_at,
            }
            for invite in recent_invites
        ],
        "recent_feedback": [
            {
                "id": item.id,
                "organization_id": item.organization_id,
                "organization_name": organization_names.get(item.organization_id, "Legacy / unknown"),
                "category": item.category,
                "message": item.message,
                "usefulness_score": item.usefulness_score,
                "created_at": item.created_at,
            }
            for item in recent_feedback
        ],
    }


@router.get("/organizations/{organization_id}")
def organization_detail(
    organization_id: int,
    session: SessionDep,
    _: AdminDep,
) -> dict[str, object]:
    organization = session.get(OrganizationRecord, organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return _studio_summary(session, organization, datetime.now(UTC))


@router.post("/organizations/{organization_id}/status")
def organization_status(
    organization_id: int,
    payload: OrganizationStatusUpdate,
    session: SessionDep,
    _: AdminDep,
) -> dict[str, object]:
    organization = session.get(OrganizationRecord, organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    organization.active = payload.active
    session.commit()
    return {"id": organization.id, "active": organization.active}


@router.post("/organizations/{organization_id}/sessions/revoke")
def revoke_sessions(
    organization_id: int,
    session: SessionDep,
    _: AdminDep,
) -> dict[str, object]:
    organization = session.get(OrganizationRecord, organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    now = datetime.now(UTC)
    rows = session.scalars(
        select(PilotSessionRecord).where(
            PilotSessionRecord.organization_id == organization_id,
            PilotSessionRecord.revoked_at.is_(None),
        )
    ).all()
    for row in rows:
        row.revoked_at = now
    session.commit()
    return {"organization_id": organization_id, "revoked_sessions": len(rows)}
