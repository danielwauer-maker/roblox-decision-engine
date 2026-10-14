from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import OrganizationRecord, SubscriptionRecord
from app.r17_models import PilotLifecycleRecord
from app.tenant_security import SessionDep, TenantDep, TenantPrincipal

PAID_ACCESS_STATUSES = {"active", "trialing", "past_due"}
PLAN_LIMITS = {"indie": 1, "growth": 3, "studio": 10}


@dataclass(frozen=True, slots=True)
class ProductAccessDecision:
    allowed: bool
    access_mode: str
    reason: str
    pilot_status: str
    billing_status: str | None
    plan_id: str | None
    experience_limit: int


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _effective_pilot_state(
    session: Session,
    organization_id: int,
    now: datetime,
) -> tuple[str, datetime | None]:
    lifecycle = session.scalar(
        select(PilotLifecycleRecord).where(
            PilotLifecycleRecord.organization_id == organization_id
        )
    )
    if lifecycle:
        ends_at = _aware(lifecycle.ends_at)
        status = lifecycle.status.upper()
        if status == "ACTIVE" and ends_at <= now:
            status = "EXPIRED"
        return status, ends_at

    organization = session.get(OrganizationRecord, organization_id)
    if not organization:
        return "MISSING", None

    # R17 lifecycle records were introduced after some organizations already existed.
    # For those tenants, the organization creation timestamp is the safest non-extending
    # fallback for the original pilot start date.
    inferred_ends_at = _aware(organization.created_at) + timedelta(days=30)
    return ("ACTIVE" if inferred_ends_at > now else "EXPIRED"), inferred_ends_at


def evaluate_product_access(
    session: Session,
    organization_id: int,
    *,
    now: datetime | None = None,
) -> ProductAccessDecision:
    current_time = now or datetime.now(UTC)
    subscription = session.scalar(
        select(SubscriptionRecord).where(
            SubscriptionRecord.organization_id == organization_id
        )
    )

    if (
        subscription
        and subscription.plan_id in PLAN_LIMITS
        and subscription.status in PAID_ACCESS_STATUSES
    ):
        return ProductAccessDecision(
            allowed=True,
            access_mode="paid",
            reason="paid_subscription_active",
            pilot_status="CONVERTED",
            billing_status=subscription.status,
            plan_id=subscription.plan_id,
            experience_limit=PLAN_LIMITS[subscription.plan_id],
        )

    pilot_status, _ = _effective_pilot_state(session, organization_id, current_time)
    if pilot_status == "ACTIVE":
        return ProductAccessDecision(
            allowed=True,
            access_mode="pilot",
            reason="pilot_active",
            pilot_status="ACTIVE",
            billing_status=subscription.status if subscription else None,
            plan_id="pilot",
            experience_limit=1,
        )

    return ProductAccessDecision(
        allowed=False,
        access_mode="blocked",
        reason="pilot_ended_paid_plan_required",
        pilot_status=pilot_status,
        billing_status=subscription.status if subscription else None,
        plan_id=subscription.plan_id if subscription else None,
        experience_limit=0,
    )


def require_product_access(
    principal: TenantDep,
    session: SessionDep,
) -> TenantPrincipal:
    decision = evaluate_product_access(session, principal.organization_id)
    if not decision.allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PRODUCT_ACCESS_REQUIRED",
                "message": "Your founding pilot has ended",
                "pilot_status": decision.pilot_status,
                "billing_status": decision.billing_status,
            },
        )
    return principal


ProductAccessDep = Annotated[TenantPrincipal, Depends(require_product_access)]
