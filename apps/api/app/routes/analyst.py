from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.domain.analyst import compose_brief
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot
from app.services.decision_snapshots import build_decision_snapshot

router = APIRouter(prefix="/v1/analyst", tags=["analyst"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


def _brief(snapshot: DecisionSnapshot, source: str) -> dict[str, object]:
    priorities = evaluate_snapshot(snapshot)
    brief = compose_brief(priorities)
    return {
        "source": source,
        "snapshot": asdict(snapshot),
        "brief": asdict(brief),
    }


@router.post("/evaluate")
def evaluate(snapshot: DecisionSnapshot) -> dict[str, object]:
    return _brief(snapshot, "request_snapshot")


@router.get("/current")
def current(session: SessionDep) -> dict[str, object]:
    settings = get_settings()
    if not settings.roblox_universe_id:
        raise HTTPException(status_code=503, detail="ROBLOX_UNIVERSE_ID is not configured")
    snapshot = build_decision_snapshot(session, settings.roblox_universe_id)
    return _brief(snapshot, "stored_roblox_observations")


@router.get("/demo")
def demo() -> dict[str, object]:
    snapshot = DecisionSnapshot(
        d1_retention=0.118,
        d1_retention_baseline=0.151,
        d1_retention_mobile=0.087,
        d1_retention_desktop=0.179,
        daily_revenue=22100,
        daily_revenue_baseline=21900,
        dau=13800,
        dau_baseline=11800,
    )
    return _brief(snapshot, "simulated_validation_data")
