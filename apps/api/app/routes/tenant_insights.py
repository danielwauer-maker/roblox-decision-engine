from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.domain.experiments import build_experiment_plan
from app.models import PilotFeedbackRecord, RobloxConnectionRecord
from app.services.ai_analyst import generate_analyst_brief
from app.services.decision_snapshots import build_decision_snapshot
from app.tenant_security import TenantDep

router = APIRouter(prefix="/v1/tenant", tags=["tenant"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


class TenantFeedback(BaseModel):
    category: Literal["onboarding", "priority", "analyst", "experiment", "weekly_brief", "other"]
    message: str = Field(min_length=3, max_length=2000)
    usefulness_score: int | None = Field(default=None, ge=1, le=5)


def _connection(session: Session, organization_id: int) -> RobloxConnectionRecord:
    connection = session.scalar(
        select(RobloxConnectionRecord)
        .where(
            RobloxConnectionRecord.organization_id == organization_id,
            RobloxConnectionRecord.active.is_(True),
        )
        .order_by(desc(RobloxConnectionRecord.updated_at))
    )
    if not connection:
        raise HTTPException(status_code=409, detail="No Roblox experience connected")
    return connection


def _snapshot(session: Session, organization_id: int):
    connection = _connection(session, organization_id)
    return build_decision_snapshot(
        session,
        connection.universe_id,
        organization_id=organization_id,
    )


@router.get("/analyst/current")
async def analyst_current(principal: TenantDep, session: SessionDep):
    snapshot = _snapshot(session, principal.organization_id)
    priorities = evaluate_snapshot(snapshot)
    result = await generate_analyst_brief(priorities)
    return {
        "source": "tenant_roblox_observations",
        "snapshot": asdict(snapshot),
        "generation": {
            "mode": result.mode,
            "model": result.model,
            "fallback_reason": result.fallback_reason,
        },
        "brief": asdict(result.brief),
    }


@router.get("/experiments/current")
def experiment_current(principal: TenantDep, session: SessionDep):
    snapshot = _snapshot(session, principal.organization_id)
    priorities = evaluate_snapshot(snapshot)
    if not priorities:
        raise HTTPException(status_code=422, detail="No supported decision priority is available")
    return {
        "source": "tenant_roblox_observations",
        "plan": asdict(build_experiment_plan(priorities[0])),
    }


@router.get("/weekly-brief")
async def weekly_brief(principal: TenantDep, session: SessionDep):
    snapshot = _snapshot(session, principal.organization_id)
    priorities = evaluate_snapshot(snapshot)
    result = await generate_analyst_brief(priorities)
    return {
        "source": "tenant_roblox_observations",
        "priority_count": len(priorities),
        "priorities": [
            {**asdict(item), "priority_score": item.priority_score} for item in priorities[:3]
        ],
        "analyst": asdict(result.brief),
        "generation": {
            "mode": result.mode,
            "model": result.model,
            "fallback_reason": result.fallback_reason,
        },
    }


@router.post("/feedback", status_code=201)
def feedback(payload: TenantFeedback, principal: TenantDep, session: SessionDep):
    record = PilotFeedbackRecord(
        organization_id=principal.organization_id,
        category=payload.category,
        message=payload.message.strip(),
        usefulness_score=payload.usefulness_score,
        created_at=datetime.now(UTC),
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return {"id": record.id, "status": "recorded"}
