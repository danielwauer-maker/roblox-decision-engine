import json
from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base
from app.models import MetricObservationRecord
from app.services.decision_snapshots import build_decision_snapshot


def add_metric(
    session: Session,
    *,
    metric: str,
    when: datetime,
    value: float,
    dimensions: dict[str, str] | None = None,
) -> None:
    dimensions = dimensions or {}
    session.add(
        MetricObservationRecord(
            universe_id="123",
            metric=metric,
            observed_at=when,
            value=value,
            dimensions_json=json.dumps(dimensions),
            dimensions_key="|".join(f"{k}={v}" for k, v in sorted(dimensions.items())),
            status=None,
            ingested_at=when,
        )
    )


def test_snapshot_uses_latest_values_and_recent_baseline() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime(2026, 10, 12, tzinfo=UTC)

    with Session(engine) as session:
        for days_ago, dau, revenue, retention in [
            (2, 1000, 500, 0.15),
            (1, 1100, 510, 0.14),
        ]:
            when = now - timedelta(days=days_ago)
            add_metric(session, metric="DailyActiveUsers", when=when, value=dau)
            add_metric(session, metric="DailyRevenue", when=when, value=revenue)
            add_metric(session, metric="ForwardD1Retention", when=when, value=retention)

        add_metric(session, metric="DailyActiveUsers", when=now, value=1300)
        add_metric(session, metric="DailyRevenue", when=now, value=515)
        add_metric(
            session,
            metric="ForwardD1Retention",
            when=now,
            value=0.09,
            dimensions={"Platform": "Phone"},
        )
        add_metric(
            session,
            metric="ForwardD1Retention",
            when=now,
            value=0.18,
            dimensions={"Platform": "Computer"},
        )
        session.commit()

        snapshot = build_decision_snapshot(session, "123")

    assert snapshot.dau == 1300
    assert snapshot.dau_baseline == 1050
    assert snapshot.daily_revenue == 515
    assert snapshot.d1_retention_mobile == 0.09
    assert snapshot.d1_retention_desktop == 0.18
