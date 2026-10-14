from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.access_control import ProductAccessDep
from app.config import get_settings
from app.db import SessionLocal
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot
from app.services.ai_analyst import generate_analyst_brief
from app.services.decision_snapshots import build_decision_snapshot

router = APIRouter(prefix="/v1/analyst", tags=["analyst"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


async def _brief(snapshot: DecisionSnapshot, source: str) -> dict[str, object]:
    priorities = evaluate_snapshot(snapshot)
    result = await generate_analyst_brief(priorities)
    return {
        "source": source,
        "snapshot": asdict(snapshot),
        "generation": {
            "mode": result.mode,
            "model": result.model,
            "fallback_reason": result.fallback_reason,
        },
        "brief": asdict(result.brief),
    }


@router.post("/evaluate")
async def evaluate(snapshot: DecisionSnapshot, _: ProductAccessDep) -> dict[str, object]:
    return await _brief(snapshot, "request_snapshot")


@router.get("/current")
async def current(_: ProductAccessDep, session: SessionDep) -> dict[str, object]:
    settings = get_settings()
    if not settings.roblox_universe_id:
        raise HTTPException(status_code=503, detail="ROBLOX_UNIVERSE_ID is not configured")
    snapshot = build_decision_snapshot(session, settings.roblox_universe_id)
    return await _brief(snapshot, "stored_roblox_observations")


@router.get("/demo")
async def demo() -> dict[str, object]:
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
    return await _brief(snapshot, "simulated_validation_data")
