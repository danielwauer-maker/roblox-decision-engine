from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.commercial_catalog import catalog, plans_by_id
from app.models import DecisionCreditUsageRecord, OrganizationRecord, SubscriptionRecord
from app.r17_models import PilotLifecycleRecord


def credit_period(session: Session, organization_id: int, now: datetime | None = None) -> tuple[datetime, int]:
    now = now or datetime.now(UTC)
    subscription = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization_id))
    if subscription and subscription.plan_id in plans_by_id():
        start = subscription.current_period_start or subscription.created_at
        return (start if start.tzinfo else start.replace(tzinfo=UTC)), plans_by_id()[subscription.plan_id]["monthly_decision_credits"]
    lifecycle = session.scalar(select(PilotLifecycleRecord).where(PilotLifecycleRecord.organization_id == organization_id))
    if lifecycle:
        start = lifecycle.started_at
        return (start if start.tzinfo else start.replace(tzinfo=UTC)), catalog()["pilot"]["decision_credits"]
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0), catalog()["pilot"]["decision_credits"]


def consume_credit(session: Session, organization_id: int, request_key: str, now: datetime | None = None) -> dict:
    if not request_key or len(request_key) > 160:
        raise HTTPException(status_code=422, detail="A unique request_key is required")
    # Serialize credit checks per organization on PostgreSQL to prevent concurrent requests
    # from both spending the final available credit.
    session.scalar(select(OrganizationRecord.id).where(OrganizationRecord.id == organization_id).with_for_update())
    start, allowance = credit_period(session, organization_id, now)
    existing = session.scalar(select(DecisionCreditUsageRecord).where(DecisionCreditUsageRecord.organization_id == organization_id, DecisionCreditUsageRecord.request_key == request_key))
    if existing:
        return {"consumed": False, "duplicate": True, "allowance": allowance}
    used = session.scalar(select(func.count()).select_from(DecisionCreditUsageRecord).where(DecisionCreditUsageRecord.organization_id == organization_id, DecisionCreditUsageRecord.period_start == start)) or 0
    if used >= allowance:
        raise HTTPException(status_code=402, detail={"code": "DECISION_CREDITS_EXHAUSTED", "allowance": allowance, "used": used})
    session.add(DecisionCreditUsageRecord(organization_id=organization_id, request_key=request_key, period_start=start, created_at=now or datetime.now(UTC)))
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        return {"consumed": False, "duplicate": True, "allowance": allowance}
    return {"consumed": True, "duplicate": False, "allowance": allowance, "used": used + 1}
