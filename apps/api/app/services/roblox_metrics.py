import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.domain.metrics import MetricObservation, normalize_metric_response
from app.integrations.roblox.client import RobloxAnalyticsClient, RobloxAnalyticsError
from app.integrations.roblox.models import Granularity, MetricQuery
from app.models import MetricObservationRecord


DEFAULT_METRICS = ("DailyActiveUsers", "Revenue", "D1Retention", "D7Retention")


@dataclass(slots=True)
class ConnectionStatus:
    mode: str
    configured: bool
    universe_id: str | None
    detail: str


def get_connection_status() -> ConnectionStatus:
    settings = get_settings()
    configured = bool(settings.roblox_universe_id and settings.roblox_api_key)
    return ConnectionStatus(
        mode="live" if configured else "demo",
        configured=configured,
        universe_id=settings.roblox_universe_id,
        detail=(
            "Roblox analytics credentials are configured."
            if configured
            else "Demo mode active. Configure ROBLOX_UNIVERSE_ID and ROBLOX_API_KEY for live sync."
        ),
    )


def _dimensions_key(dimensions: dict[str, str]) -> str:
    return "|".join(f"{key}={dimensions[key]}" for key in sorted(dimensions))


def persist_observations(
    session: Session,
    *,
    universe_id: str,
    observations: list[MetricObservation],
) -> int:
    inserted = 0
    now = datetime.now(UTC)
    for observation in observations:
        dimensions_key = _dimensions_key(observation.dimensions)
        exists = session.scalar(
            select(MetricObservationRecord.id).where(
                MetricObservationRecord.universe_id == universe_id,
                MetricObservationRecord.metric == observation.metric,
                MetricObservationRecord.observed_at == observation.time,
                MetricObservationRecord.dimensions_key == dimensions_key,
            )
        )
        if exists:
            continue
        session.add(
            MetricObservationRecord(
                universe_id=universe_id,
                metric=observation.metric,
                observed_at=observation.time,
                value=observation.value,
                dimensions_json=json.dumps(observation.dimensions, sort_keys=True),
                dimensions_key=dimensions_key,
                status=observation.status,
                ingested_at=now,
            )
        )
        inserted += 1
    session.commit()
    return inserted


async def sync_metric(
    session: Session,
    *,
    metric: str,
    days: int = 30,
) -> dict[str, object]:
    settings = get_settings()
    if not settings.roblox_universe_id or not settings.roblox_api_key:
        raise RobloxAnalyticsError("Live Roblox analytics is not configured")

    end_time = datetime.now(UTC)
    start_time = end_time - timedelta(days=days)
    client = RobloxAnalyticsClient(
        universe_id=settings.roblox_universe_id,
        api_key=settings.roblox_api_key.get_secret_value(),
        base_url=settings.roblox_analytics_base_url,
    )
    response = await client.query_metric(
        MetricQuery(
            metric=metric,
            granularity=Granularity.ONE_DAY,
            start_time=start_time,
            end_time=end_time,
        )
    )
    observations = normalize_metric_response(metric, response)
    inserted = persist_observations(
        session,
        universe_id=settings.roblox_universe_id,
        observations=observations,
    )
    return {
        "metric": metric,
        "received": len(observations),
        "inserted": inserted,
        "universe_id": settings.roblox_universe_id,
    }


async def sync_default_metrics(session: Session, *, days: int = 30) -> dict[str, object]:
    results = []
    for metric in DEFAULT_METRICS:
        results.append(await sync_metric(session, metric=metric, days=days))
    return {"metrics": results, "days": days}
