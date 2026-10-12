from dataclasses import asdict
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.integrations.roblox.client import RobloxAnalyticsError
from app.models import (
    MetricObservationRecord,
    OrganizationRecord,
    PilotInviteRecord,
    PilotSessionRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
)
from app.services.decision_snapshots import build_decision_snapshot
from app.services.roblox_metrics import (
    sync_default_metrics_for_connection,
    sync_metric_for_connection,
)
from app.tenant_security import (
    TenantDep,
    decrypt_credential,
    encrypt_credential,
    hash_token,
    invite_expiry,
    new_opaque_token,
    require_admin,
    session_expiry,
)

router = APIRouter(prefix="/v1/tenant", tags=["tenant"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


class OrganizationCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=2, max_length=160)


class InviteCreate(BaseModel):
    organization_id: int
    email: str = Field(min_length=3, max_length=254)
    role: str = Field(default="MEMBER", pattern=r"^(OWNER|MEMBER)$")


class InviteRedeem(BaseModel):
    token: str = Field(min_length=20, max_length=200)


class RobloxConnectionCreate(BaseModel):
    universe_id: str = Field(min_length=1, max_length=64, pattern=r"^[0-9]+$")
    api_key: str = Field(min_length=20, max_length=4000)
    experience_name: str | None = Field(default=None, max_length=160)


def _owner_only(role: str) -> None:
    if role != "OWNER":
        raise HTTPException(status_code=403, detail="Owner role required")


@router.post("/admin/organizations")
def create_organization(payload: OrganizationCreate, session: SessionDep, _: AdminDep):
    if session.scalar(select(OrganizationRecord.id).where(OrganizationRecord.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Organization slug already exists")
    organization = OrganizationRecord(
        slug=payload.slug,
        name=payload.name,
        active=True,
        created_at=datetime.now(UTC),
    )
    session.add(organization)
    session.commit()
    session.refresh(organization)
    return {"id": organization.id, "slug": organization.slug, "name": organization.name}


@router.post("/admin/invites")
def create_invite(payload: InviteCreate, session: SessionDep, _: AdminDep):
    organization = session.get(OrganizationRecord, payload.organization_id)
    if not organization or not organization.active:
        raise HTTPException(status_code=404, detail="Organization not found")
    raw_token = new_opaque_token()
    invite = PilotInviteRecord(
        organization_id=organization.id,
        email=payload.email.strip().lower(),
        role=payload.role,
        token_hash=hash_token(raw_token),
        expires_at=invite_expiry(),
        redeemed_at=None,
        created_at=datetime.now(UTC),
    )
    session.add(invite)
    session.commit()
    return {
        "invite_token": raw_token,
        "expires_at": invite.expires_at,
        "organization_id": organization.id,
        "email": invite.email,
    }


@router.post("/auth/redeem")
def redeem_invite(payload: InviteRedeem, session: SessionDep):
    invite = session.scalar(
        select(PilotInviteRecord).where(PilotInviteRecord.token_hash == hash_token(payload.token))
    )
    now = datetime.now(UTC)
    if not invite or invite.redeemed_at is not None or invite.expires_at <= now:
        raise HTTPException(status_code=401, detail="Invite expired or invalid")
    organization = session.get(OrganizationRecord, invite.organization_id)
    if not organization or not organization.active:
        raise HTTPException(status_code=403, detail="Organization disabled")

    user = session.scalar(
        select(PilotUserRecord).where(
            PilotUserRecord.organization_id == invite.organization_id,
            PilotUserRecord.email == invite.email,
        )
    )
    if not user:
        user = PilotUserRecord(
            organization_id=invite.organization_id,
            email=invite.email,
            role=invite.role,
            active=True,
            created_at=now,
        )
        session.add(user)
        session.flush()

    raw_session = new_opaque_token()
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=invite.organization_id,
            token_hash=hash_token(raw_session),
            expires_at=session_expiry(),
            revoked_at=None,
            created_at=now,
        )
    )
    invite.redeemed_at = now
    session.commit()
    return {
        "access_token": raw_session,
        "token_type": "bearer",
        "organization": {"id": organization.id, "slug": organization.slug, "name": organization.name},
        "user": {"email": user.email, "role": user.role},
    }


@router.get("/me")
def me(principal: TenantDep, session: SessionDep):
    organization = session.get(OrganizationRecord, principal.organization_id)
    return {
        "user": {"id": principal.user_id, "email": principal.email, "role": principal.role},
        "organization": {"id": organization.id, "slug": organization.slug, "name": organization.name},
    }


@router.put("/roblox/connection")
def upsert_connection(payload: RobloxConnectionCreate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    connection = session.scalar(
        select(RobloxConnectionRecord).where(
            RobloxConnectionRecord.organization_id == principal.organization_id,
            RobloxConnectionRecord.universe_id == payload.universe_id,
        )
    )
    now = datetime.now(UTC)
    encrypted = encrypt_credential(payload.api_key)
    if connection:
        connection.encrypted_api_key = encrypted
        connection.experience_name = payload.experience_name
        connection.active = True
        connection.updated_at = now
    else:
        connection = RobloxConnectionRecord(
            organization_id=principal.organization_id,
            universe_id=payload.universe_id,
            experience_name=payload.experience_name,
            encrypted_api_key=encrypted,
            active=True,
            created_at=now,
            updated_at=now,
        )
        session.add(connection)
    session.commit()
    session.refresh(connection)
    return {
        "id": connection.id,
        "universe_id": connection.universe_id,
        "experience_name": connection.experience_name,
        "configured": True,
    }


@router.get("/roblox/connections")
def connections(principal: TenantDep, session: SessionDep):
    rows = session.scalars(
        select(RobloxConnectionRecord).where(
            RobloxConnectionRecord.organization_id == principal.organization_id,
            RobloxConnectionRecord.active.is_(True),
        )
    ).all()
    return {
        "count": len(rows),
        "items": [
            {
                "id": row.id,
                "universe_id": row.universe_id,
                "experience_name": row.experience_name,
                "configured": True,
            }
            for row in rows
        ],
    }


def _connection_for_tenant(session: Session, organization_id: int) -> RobloxConnectionRecord:
    connection = session.scalar(
        select(RobloxConnectionRecord)
        .where(
            RobloxConnectionRecord.organization_id == organization_id,
            RobloxConnectionRecord.active.is_(True),
        )
        .order_by(desc(RobloxConnectionRecord.updated_at))
    )
    if not connection:
        raise HTTPException(status_code=409, detail="No Roblox experience connected")
    return connection


@router.post("/roblox/sync")
async def sync_tenant(
    principal: TenantDep,
    session: SessionDep,
    metric: str | None = Query(default=None),
    days: int = Query(default=30, ge=1, le=365),
):
    connection = _connection_for_tenant(session, principal.organization_id)
    try:
        api_key = decrypt_credential(connection.encrypted_api_key)
        if metric:
            return await sync_metric_for_connection(
                session,
                organization_id=principal.organization_id,
                universe_id=connection.universe_id,
                api_key=api_key,
                metric=metric,
                days=days,
            )
        return await sync_default_metrics_for_connection(
            session,
            organization_id=principal.organization_id,
            universe_id=connection.universe_id,
            api_key=api_key,
            days=days,
        )
    except RobloxAnalyticsError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/roblox/observations")
def observations(
    principal: TenantDep,
    session: SessionDep,
    metric: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
):
    query = select(MetricObservationRecord).where(
        MetricObservationRecord.organization_id == principal.organization_id
    )
    if metric:
        query = query.where(MetricObservationRecord.metric == metric)
    rows = session.scalars(query.order_by(desc(MetricObservationRecord.observed_at)).limit(limit)).all()
    return {
        "count": len(rows),
        "items": [
            {
                "universe_id": row.universe_id,
                "metric": row.metric,
                "time": row.observed_at,
                "value": row.value,
                "dimensions": row.dimensions_json,
                "status": row.status,
            }
            for row in rows
        ],
    }


@router.get("/decisions/current")
def current_decisions(principal: TenantDep, session: SessionDep):
    connection = _connection_for_tenant(session, principal.organization_id)
    snapshot = build_decision_snapshot(
        session,
        connection.universe_id,
        organization_id=principal.organization_id,
    )
    priorities = evaluate_snapshot(snapshot)
    return {
        "source": "tenant_roblox_observations",
        "snapshot": asdict(snapshot),
        "count": len(priorities),
        "items": [{**asdict(item), "priority_score": item.priority_score} for item in priorities],
    }
