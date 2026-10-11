from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.integrations.roblox.client import RobloxAnalyticsError
from app.models import MetricObservationRecord
from app.services.roblox_metrics import get_connection_status, sync_default_metrics, sync_metric

router = APIRouter(prefix="/v1/roblox", tags=["roblox"])
SessionDep = Annotated[Session, Depends(get_session)]


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@router.get("/connection")
def connection() -> dict[str, object]:
    status = get_connection_status()
    return {
        "mode": status.mode,
        "configured": status.configured,
        "universe_id": status.universe_id,
        "detail": status.detail,
    }


@router.post("/sync")
async def sync(
    session: SessionDep,
    metric: str | None = Query(default=None),
    days: int = Query(default=30, ge=1, le=365),
) -> dict[str, object]:
    try:
        if metric:
            return await sync_metric(session, metric=metric, days=days)
        return await sync_default_metrics(session, days=days)
    except RobloxAnalyticsError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/observations")
def observations(
    session: SessionDep,
    metric: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
) -> dict[str, object]:
    query = select(MetricObservationRecord)
    if metric:
        query = query.where(MetricObservationRecord.metric == metric)
    query = query.order_by(desc(MetricObservationRecord.observed_at)).limit(limit)
    rows = session.scalars(query).all()
    return {
        "count": len(rows),
        "items": [
            {
                "metric": row.metric,
                "time": row.observed_at,
                "value": row.value,
                "dimensions": row.dimensions_json,
                "status": row.status,
            }
            for row in rows
        ],
    }
