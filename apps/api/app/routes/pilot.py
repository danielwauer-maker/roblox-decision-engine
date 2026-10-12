from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.domain.pilot import evaluate_pilot_readiness
from app.models import MetricObservationRecord, PilotFeedbackRecord
from app.services.decision_snapshots import build_decision_snapshot
from app.services.roblox_metrics import get_connection_status

router = APIRouter(prefix="/v1/pilot", tags=["pilot"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


class PilotFeedback(BaseModel):
    category: Literal["onboarding", "priority", "analyst", "experiment", "weekly_brief", "other"]
    message: str = Field(min_length=3, max_length=2000)
    usefulness_score: int | None = Field(default=None, ge=1, le=5)


@router.get("/readiness")
def readiness(session: SessionDep) -> dict[str, object]:
    settings = get_settings()
    connection = get_connection_status()
    observation_count = 0
    priority_count = 0

    if settings.roblox_universe_id:
        observation_count = session.scalar(
            select(func.count(MetricObservationRecord.id)).where(
                MetricObservationRecord.universe_id == settings.roblox_universe_id
            )
        ) or 0
        if observation_count:
            snapshot = build_decision_snapshot(session, settings.roblox_universe_id)
            priority_count = len(evaluate_snapshot(snapshot))

    result = evaluate_pilot_readiness(
        configured=connection.configured,
        observation_count=observation_count,
        priority_count=priority_count,
    )
    return {
        **asdict(result),
        "connection": asdict(connection),
        "observation_count": observation_count,
        "priority_count": priority_count,
    }


@router.post("/feedback", status_code=201)
def feedback(payload: PilotFeedback, session: SessionDep) -> dict[str, object]:
    record = PilotFeedbackRecord(
        category=payload.category,
        message=payload.message.strip(),
        usefulness_score=payload.usefulness_score,
        created_at=datetime.now(UTC),
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return {"id": record.id, "status": "recorded"}
