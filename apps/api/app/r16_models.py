from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PilotMilestoneRecord(Base):
    __tablename__ = "pilot_milestones"
    __table_args__ = (
        UniqueConstraint("organization_id", "milestone", name="uq_pilot_milestone_org_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("pilot_users.id"), index=True)
    milestone: Mapped[str] = mapped_column(String(64), index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class NotificationPreferenceRecord(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id"), unique=True, index=True
    )
    lifecycle_email_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
