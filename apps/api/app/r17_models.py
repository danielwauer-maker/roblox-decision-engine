from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PilotLifecycleRecord(Base):
    __tablename__ = "pilot_lifecycle"
    __table_args__ = (UniqueConstraint("organization_id", name="uq_pilot_lifecycle_org"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), index=True)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    converted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pilot_consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class ApplicationAttributionRecord(Base):
    __tablename__ = "application_attribution"
    __table_args__ = (UniqueConstraint("application_id", name="uq_application_attribution_application"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("pilot_applications.id"), index=True)
    utm_source: Mapped[str | None] = mapped_column(String(160), nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String(160), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(240), nullable=True)
    utm_content: Mapped[str | None] = mapped_column(String(240), nullable=True)
    utm_term: Mapped[str | None] = mapped_column(String(240), nullable=True)
    referrer: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    landing_page: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class ApplicationReviewRecord(Base):
    __tablename__ = "application_reviews"
    __table_args__ = (UniqueConstraint("application_id", name="uq_application_review_application"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("pilot_applications.id"), index=True)
    pipeline_status: Mapped[str] = mapped_column(String(32), default="APPLIED", index=True)
    internal_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
