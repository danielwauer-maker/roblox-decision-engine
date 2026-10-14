from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import OrganizationRecord, SubscriptionRecord
from app.r17_models import PilotLifecycleRecord
from app.tenant_security import SessionDep, TenantDep, TenantPrincipal

PAID_ACCESS_STATUSES = {"active", "trialing"}
PAST_DUE_GRACE_PERIOD = timedelta(days=7)
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
    billing_grace_ends_at: datetime | None


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _past_due_grace_ends_at(subscription: SubscriptionRecord) -> datetime:
    return _aware(subscription.updated_at) + PAST_DUE_GRACE_PERIOD


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
        # CONVERTED is a commercial lifecycle marker, not an instruction to erase
        # the remainder of the original 30-day pilot window. Paid access wins while
        # healthy; if billing later fails before ends_at, the customer may still use
        # whatever time remains in the founding pilot.
        if status in {"ACTIVE", "CONVERTED"}:
            status = "ACTIVE" if ends_at > now else "EXPIRED"
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
            billing_grace_ends_at=None,
        )

    if (
        subscription
        and subscription.plan_id in PLAN_LIMITS
        and subscription.status == "past_due"
    ):
        grace_ends_at = _past_due_grace_ends_at(subscription)
        if current_time < grace_ends_at:
            return ProductAccessDecision(
                allowed=True,
                access_mode="paid",
                reason="paid_subscription_past_due_grace",
                pilot_status="CONVERTED",
                billing_status=subscription.status,
                plan_id=subscription.plan_id,
                experience_limit=PLAN_LIMITS[subscription.plan_id],
                billing_grace_ends_at=grace_ends_at,
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
            billing_grace_ends_at=(
                _past_due_grace_ends_at(subscription)
                if subscription and subscription.status == "past_due"
                else None
            ),
        )

    return ProductAccessDecision(
        allowed=False,
        access_mode="blocked",
        reason=(
            "past_due_grace_expired"
            if subscription and subscription.status == "past_due"
            else "pilot_ended_paid_plan_required"
        ),
        pilot_status=pilot_status,
        billing_status=subscription.status if subscription else None,
        plan_id=subscription.plan_id if subscription else None,
        experience_limit=0,
        billing_grace_ends_at=(
            _past_due_grace_ends_at(subscription)
            if subscription and subscription.status == "past_due"
            else None
        ),
    )


def require_product_access(
    principal: TenantDep,
    session: SessionDep,
) -> TenantPrincipal:
    decision = evaluate_product_access(session, principal.organization_id)
    if not decision.allowed:
        message = (
            "Your payment grace period has ended"
            if decision.reason == "past_due_grace_expired"
            else "Your founding pilot has ended"
        )
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PRODUCT_ACCESS_REQUIRED",
                "message": message,
                "pilot_status": decision.pilot_status,
                "billing_status": decision.billing_status,
                "billing_grace_ends_at": (
                    decision.billing_grace_ends_at.isoformat()
                    if decision.billing_grace_ends_at
                    else None
                ),
            },
        )
    return principal


ProductAccessDep = Annotated[TenantPrincipal, Depends(require_product_access)]
