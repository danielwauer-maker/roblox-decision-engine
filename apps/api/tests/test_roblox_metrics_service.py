from datetime import UTC, datetime

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import Base
from app.domain.metrics import MetricObservation
from app.models import MetricObservationRecord
from app.services.roblox_metrics import get_connection_status, persist_observations


def test_connection_status_defaults_to_demo(monkeypatch) -> None:
    monkeypatch.delenv("ROBLOX_UNIVERSE_ID", raising=False)
    monkeypatch.delenv("ROBLOX_API_KEY", raising=False)
    get_settings.cache_clear()

    status = get_connection_status()

    assert status.mode == "demo"
    assert status.configured is False
    get_settings.cache_clear()


def test_persist_observations_is_idempotent() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    observation = MetricObservation(
        metric="DailyActiveUsers",
        time=datetime(2026, 10, 12, tzinfo=UTC),
        value=1234,
        dimensions={"platform": "Mobile"},
    )

    with Session(engine) as session:
        first = persist_observations(
            session,
            universe_id="42",
            observations=[observation],
        )
        second = persist_observations(
            session,
            universe_id="42",
            observations=[observation],
        )
        rows = session.scalars(select(MetricObservationRecord)).all()

    assert first == 1
    assert second == 0
    assert len(rows) == 1
    assert rows[0].metric == "DailyActiveUsers"
    assert rows[0].dimensions_key == "platform=Mobile"
