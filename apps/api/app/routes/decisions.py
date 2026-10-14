from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.access_control import ProductAccessDep
from app.config import get_settings
from app.db import SessionLocal
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot
from app.services.decision_snapshots import build_decision_snapshot

router = APIRouter(prefix="/v1/decisions", tags=["decisions"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


def _serialize(snapshot: DecisionSnapshot, source: str) -> dict[str, object]:
    priorities = evaluate_snapshot(snapshot)
    return {
        "source": source,
        "snapshot": asdict(snapshot),
        "count": len(priorities),
        "items": [
            {
                **asdict(priority),
                "priority_score": priority.priority_score,
            }
            for priority in priorities
        ],
    }


@router.post("/evaluate")
def evaluate(snapshot: DecisionSnapshot, _: ProductAccessDep) -> dict[str, object]:
    return _serialize(snapshot, "request_snapshot")


@router.get("/current")
def current(_: ProductAccessDep, session: SessionDep) -> dict[str, object]:
    settings = get_settings()
    if not settings.roblox_universe_id:
        raise HTTPException(status_code=503, detail="ROBLOX_UNIVERSE_ID is not configured")
    snapshot = build_decision_snapshot(session, settings.roblox_universe_id)
    return _serialize(snapshot, "stored_roblox_observations")


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
    return _serialize(snapshot, "simulated_validation_data")
