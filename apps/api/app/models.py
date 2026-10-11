from datetime import datetime

from sqlalchemy import DateTime, Float, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class MetricObservationRecord(Base):
    __tablename__ = "metric_observations"
    __table_args__ = (
        UniqueConstraint(
            "universe_id",
            "metric",
            "observed_at",
            "dimensions_key",
            name="uq_metric_observation_identity",
        ),
        Index("ix_metric_observations_metric_time", "metric", "observed_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    universe_id: Mapped[str] = mapped_column(String(64), index=True)
    metric: Mapped[str] = mapped_column(String(120), index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    value: Mapped[float] = mapped_column(Float)
    dimensions_json: Mapped[str] = mapped_column(Text, default="{}")
    dimensions_key: Mapped[str] = mapped_column(String(512), default="")
    status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
