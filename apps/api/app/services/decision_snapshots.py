import json
from collections import defaultdict
from statistics import mean

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.domain.decision_engine import DecisionSnapshot
from app.models import MetricObservationRecord


def _rows(
    session: Session,
    universe_id: str,
    metric: str,
    limit: int = 60,
    organization_id: int | None = None,
):
    query = select(MetricObservationRecord).where(
        MetricObservationRecord.universe_id == universe_id,
        MetricObservationRecord.metric == metric,
    )
    if organization_id is None:
        query = query.where(MetricObservationRecord.organization_id.is_(None))
    else:
        query = query.where(MetricObservationRecord.organization_id == organization_id)
    query = query.order_by(desc(MetricObservationRecord.observed_at)).limit(limit)
    return list(session.scalars(query).all())


def _current_and_baseline(rows: list[MetricObservationRecord]) -> tuple[float | None, float | None]:
    if not rows:
        return None, None
    by_time: dict[object, list[float]] = defaultdict(list)
    for row in rows:
        by_time[row.observed_at].append(row.value)
    points = sorted(((time, sum(values)) for time, values in by_time.items()), reverse=True)
    current = points[0][1]
    baseline_values = [value for _, value in points[1:8]]
    baseline = mean(baseline_values) if baseline_values else None
    return current, baseline


def _retention_segments(rows: list[MetricObservationRecord]) -> tuple[float | None, float | None]:
    if not rows:
        return None, None
    latest_time = max(row.observed_at for row in rows)
    segments: dict[str, list[float]] = defaultdict(list)
    for row in rows:
        if row.observed_at != latest_time:
            continue
        try:
            dimensions = json.loads(row.dimensions_json or "{}")
        except json.JSONDecodeError:
            continue
        text = " ".join(str(value).lower() for value in dimensions.values())
        if any(token in text for token in ("mobile", "phone", "tablet")):
            segments["mobile"].append(row.value)
        elif any(token in text for token in ("desktop", "computer", "pc")):
            segments["desktop"].append(row.value)
    mobile = mean(segments["mobile"]) if segments["mobile"] else None
    desktop = mean(segments["desktop"]) if segments["desktop"] else None
    return mobile, desktop


def build_decision_snapshot(
    session: Session,
    universe_id: str,
    organization_id: int | None = None,
) -> DecisionSnapshot:
    retention_rows = _rows(
        session,
        universe_id,
        "ForwardD1Retention",
        organization_id=organization_id,
    )
    revenue_rows = _rows(
        session,
        universe_id,
        "DailyRevenue",
        organization_id=organization_id,
    )
    dau_rows = _rows(
        session,
        universe_id,
        "DailyActiveUsers",
        organization_id=organization_id,
    )

    retention, retention_baseline = _current_and_baseline(retention_rows)
    revenue, revenue_baseline = _current_and_baseline(revenue_rows)
    dau, dau_baseline = _current_and_baseline(dau_rows)
    mobile, desktop = _retention_segments(retention_rows)

    return DecisionSnapshot(
        d1_retention=retention,
        d1_retention_baseline=retention_baseline,
        d1_retention_mobile=mobile,
        d1_retention_desktop=desktop,
        daily_revenue=revenue,
        daily_revenue_baseline=revenue_baseline,
        dau=dau,
        dau_baseline=dau_baseline,
    )
