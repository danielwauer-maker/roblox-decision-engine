from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.models import MetricObservationRecord, PilotFeedbackRecord, RobloxConnectionRecord
from app.r16_models import PilotMilestoneRecord
from app.services.decision_snapshots import build_decision_snapshot
from app.tenant_security import TenantDep

router = APIRouter(prefix="/v1/tenant", tags=["tenant-progress"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
MilestoneKey = Literal["priority_reviewed", "experiment_reviewed", "weekly_reviewed"]


def _step(key: str, label: str, status: str, detail: str, action: str | None = None) -> dict[str, str | None]:
    return {"key": key, "label": label, "status": status, "detail": detail, "next_action": action}


@router.post("/progress/milestones/{milestone}")
def complete_milestone(milestone: MilestoneKey, principal: TenantDep, session: SessionDep):
    existing = session.scalar(
        select(PilotMilestoneRecord).where(
            PilotMilestoneRecord.organization_id == principal.organization_id,
            PilotMilestoneRecord.milestone == milestone,
        )
    )
    if existing:
        return {"status": "completed", "milestone": milestone, "completed_at": existing.completed_at}

    if milestone in {"priority_reviewed", "experiment_reviewed", "weekly_reviewed"}:
        connection = session.scalar(
            select(RobloxConnectionRecord).where(
                RobloxConnectionRecord.organization_id == principal.organization_id,
                RobloxConnectionRecord.active.is_(True),
            )
        )
        if not connection:
            raise HTTPException(status_code=409, detail="Connect a Roblox experience first")
        observation_count = session.scalar(
            select(func.count(MetricObservationRecord.id)).where(
                MetricObservationRecord.organization_id == principal.organization_id
            )
        ) or 0
        if not observation_count:
            raise HTTPException(status_code=409, detail="A successful analytics sync is required first")
        snapshot = build_decision_snapshot(
            session,
            connection.universe_id,
            organization_id=principal.organization_id,
        )
        if not evaluate_snapshot(snapshot):
            raise HTTPException(status_code=409, detail="A supported priority is required first")

    record = PilotMilestoneRecord(
        organization_id=principal.organization_id,
        user_id=principal.user_id,
        milestone=milestone,
        completed_at=datetime.now(UTC),
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return {"status": "completed", "milestone": milestone, "completed_at": record.completed_at}


@router.get("/progress")
def progress(principal: TenantDep, session: SessionDep):
    connection = session.scalar(
        select(RobloxConnectionRecord)
        .where(
            RobloxConnectionRecord.organization_id == principal.organization_id,
            RobloxConnectionRecord.active.is_(True),
        )
        .order_by(RobloxConnectionRecord.updated_at.desc())
    )
    observation_count = session.scalar(
        select(func.count(MetricObservationRecord.id)).where(
            MetricObservationRecord.organization_id == principal.organization_id
        )
    ) or 0
    feedback_count = session.scalar(
        select(func.count(PilotFeedbackRecord.id)).where(
            PilotFeedbackRecord.organization_id == principal.organization_id
        )
    ) or 0
    milestone_rows = session.scalars(
        select(PilotMilestoneRecord).where(
            PilotMilestoneRecord.organization_id == principal.organization_id
        )
    ).all()
    milestones = {row.milestone for row in milestone_rows}

    priorities = []
    if connection and observation_count:
        snapshot = build_decision_snapshot(
            session,
            connection.universe_id,
            organization_id=principal.organization_id,
        )
        priorities = evaluate_snapshot(snapshot)

    has_connection = connection is not None
    has_data = observation_count > 0
    has_priority = len(priorities) > 0
    priority_reviewed = "priority_reviewed" in milestones
    experiment_reviewed = "experiment_reviewed" in milestones
    weekly_reviewed = "weekly_reviewed" in milestones

    steps = [
        _step(
            "connect",
            "Connect experience",
            "COMPLETED" if has_connection else "READY",
            "A private Roblox experience is connected." if has_connection else "Add a read-only Roblox Open Cloud analytics connection.",
            None if has_connection else "Connect your Roblox experience",
        ),
        _step(
            "sync",
            "Complete first sync",
            "COMPLETED" if has_data else ("READY" if has_connection else "LOCKED"),
            f"{observation_count} tenant observations are stored." if has_data else ("Run the first analytics sync." if has_connection else "Connect an experience first."),
            None if has_data else ("Sync the last 30 days" if has_connection else None),
        ),
        _step(
            "priority",
            "Review first priority and evidence",
            "COMPLETED" if priority_reviewed else ("READY" if has_priority else ("WAITING_FOR_DATA" if has_data else "LOCKED")),
            "The first supported priority and its evidence were reviewed." if priority_reviewed else (f"{len(priorities)} supported priorities are available." if has_priority else ("Data is present, but no supported decision threshold has been crossed yet." if has_data else "A successful sync with sufficient data is required.")),
            None if priority_reviewed else ("Open Evidence and review the first priority" if has_priority else ("Collect more live analytics" if has_data else None)),
        ),
        _step(
            "experiment",
            "Build first experiment",
            "COMPLETED" if experiment_reviewed else ("READY" if has_priority else "LOCKED"),
            "The first experiment plan was reviewed." if experiment_reviewed else ("Experiment Copilot can build from the top supported priority." if has_priority else "A supported priority is required first."),
            None if experiment_reviewed else ("Open Experiment Copilot" if has_priority else None),
        ),
        _step(
            "weekly",
            "Review first Weekly Brief",
            "COMPLETED" if weekly_reviewed else ("READY" if has_priority else "LOCKED"),
            "The first Weekly Brief was reviewed." if weekly_reviewed else ("A tenant-scoped Weekly Brief is available." if has_priority else "Weekly Brief unlocks after supported priorities exist."),
            None if weekly_reviewed else ("Open Weekly Brief" if has_priority else None),
        ),
    ]

    first_incomplete = next((item for item in steps if item["status"] != "COMPLETED"), None)
    return {
        "organization_id": principal.organization_id,
        "steps": steps,
        "next": first_incomplete,
        "summary": {
            "connected": has_connection,
            "observation_count": observation_count,
            "priority_count": len(priorities),
            "feedback_count": feedback_count,
            "milestones": sorted(milestones),
            "top_priority": asdict(priorities[0]) if priorities else None,
        },
    }
