from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.access_control import ProductAccessDep, evaluate_product_access
from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.domain.experiments import build_experiment_plan
from app.models import PilotFeedbackRecord, RobloxConnectionRecord
from app.services.ai_analyst import generate_analyst_brief
from app.services.decision_snapshots import build_decision_snapshot
from app.services.experience_entitlements import (
    active_connections_for_organization,
    entitled_connections_for_organization,
)
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


def _connection(session: Session, organization_id: int, connection_id: int | None) -> RobloxConnectionRecord:
    access = evaluate_product_access(session, organization_id)
    rows = entitled_connections_for_organization(session, organization_id, access.experience_limit)
    if not rows:
        if len(active_connections_for_organization(session, organization_id)) > access.experience_limit:
            raise HTTPException(status_code=409, detail="Experience selection required after plan change")
        raise HTTPException(status_code=409, detail="No entitled Roblox experience connected")
    if connection_id is None:
        if len(rows) > 1:
            raise HTTPException(status_code=409, detail="Choose an experience for this action")
        return rows[0]
    for row in rows:
        if row.id == connection_id:
            return row
    raise HTTPException(status_code=403, detail="Experience is not active or entitled for this workspace")


def _snapshot(session: Session, organization_id: int, connection_id: int | None):
    connection = _connection(session, organization_id, connection_id)
    return connection, build_decision_snapshot(session, connection.universe_id, organization_id=organization_id)


@router.get("/analyst/current")
async def analyst_current(principal: ProductAccessDep, session: SessionDep, connection_id: int | None = Query(default=None, ge=1)):
    connection, snapshot = _snapshot(session, principal.organization_id, connection_id)
    priorities = evaluate_snapshot(snapshot)
    result = await generate_analyst_brief(priorities)
    return {"source": "tenant_roblox_observations", "connection_id": connection.id, "universe_id": connection.universe_id, "snapshot": asdict(snapshot), "generation": {"mode": result.mode, "model": result.model, "fallback_reason": result.fallback_reason}, "brief": asdict(result.brief)}


@router.get("/experiments/current")
def experiment_current(principal: ProductAccessDep, session: SessionDep, connection_id: int | None = Query(default=None, ge=1)):
    connection, snapshot = _snapshot(session, principal.organization_id, connection_id)
    priorities = evaluate_snapshot(snapshot)
    if not priorities:
        raise HTTPException(status_code=422, detail="No supported decision priority is available")
    return {"source": "tenant_roblox_observations", "connection_id": connection.id, "universe_id": connection.universe_id, "plan": asdict(build_experiment_plan(priorities[0]))}


@router.get("/weekly-brief")
async def weekly_brief(principal: ProductAccessDep, session: SessionDep, connection_id: int | None = Query(default=None, ge=1)):
    connection, snapshot = _snapshot(session, principal.organization_id, connection_id)
    priorities = evaluate_snapshot(snapshot)
    result = await generate_analyst_brief(priorities)
    return {"source": "tenant_roblox_observations", "connection_id": connection.id, "universe_id": connection.universe_id, "priority_count": len(priorities), "priorities": [{**asdict(item), "priority_score": item.priority_score} for item in priorities[:3]], "analyst": asdict(result.brief), "generation": {"mode": result.mode, "model": result.model, "fallback_reason": result.fallback_reason}}


@router.post("/feedback", status_code=201)
def feedback(payload: TenantFeedback, principal: TenantDep, session: SessionDep):
    record = PilotFeedbackRecord(organization_id=principal.organization_id, category=payload.category, message=payload.message.strip(), usefulness_score=payload.usefulness_score, created_at=datetime.now(UTC))
    session.add(record)
    session.commit()
    session.refresh(record)
    return {"id": record.id, "status": "recorded"}
