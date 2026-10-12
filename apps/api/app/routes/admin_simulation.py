import json
import math
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from typing import Annotated

from app.db import SessionLocal
from app.models import (
    MetricObservationRecord,
    OrganizationRecord,
    PilotFeedbackRecord,
    PilotInviteRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
)
from app.tenant_security import hash_token, invite_expiry, new_opaque_token, require_admin

router = APIRouter(prefix="/v1/admin/simulation", tags=["admin", "simulation"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


SIMULATIONS = (
    {
        "slug": "novaquest-studios-sim",
        "name": "NovaQuest Studios",
        "universe_id": "900000001",
        "experience_name": "NovaQuest",
        "owner_email": "owner@novaquest.example",
        "baseline_dau": 23000.0,
        "current_dau": 29000.0,
        "baseline_revenue": 1700.0,
        "current_revenue": 1720.0,
        "baseline_mobile_d1": 0.29,
        "baseline_desktop_d1": 0.34,
        "current_mobile_d1": 0.19,
        "current_desktop_d1": 0.33,
        "baseline_d7": 0.13,
        "current_d7": 0.09,
        "feedback": "Simulation: mobile onboarding is intentionally degraded after the latest growth push.",
    },
    {
        "slug": "tycoon-forge-sim",
        "name": "Tycoon Forge",
        "universe_id": "900000002",
        "experience_name": "Tycoon Forge",
        "owner_email": "owner@tycoonforge.example",
        "baseline_dau": 5000.0,
        "current_dau": 7200.0,
        "baseline_revenue": 550.0,
        "current_revenue": 555.0,
        "baseline_mobile_d1": 0.33,
        "baseline_desktop_d1": 0.35,
        "current_mobile_d1": 0.34,
        "current_desktop_d1": 0.35,
        "baseline_d7": 0.15,
        "current_d7": 0.15,
        "feedback": "Simulation: retention stays healthy while traffic growth materially outpaces monetization.",
    },
)


def _ensure_org(session: Session, spec: dict[str, object], now: datetime) -> OrganizationRecord:
    organization = session.scalar(
        select(OrganizationRecord).where(OrganizationRecord.slug == spec["slug"])
    )
    if not organization:
        organization = OrganizationRecord(
            slug=str(spec["slug"]),
            name=str(spec["name"]),
            data_mode="SIMULATED",
            active=True,
            created_at=now,
        )
        session.add(organization)
        session.flush()
    else:
        organization.name = str(spec["name"])
        organization.data_mode = "SIMULATED"
        organization.active = True
    return organization


def _ensure_user(session: Session, organization: OrganizationRecord, email: str, now: datetime) -> None:
    user = session.scalar(
        select(PilotUserRecord).where(
            PilotUserRecord.organization_id == organization.id,
            PilotUserRecord.email == email,
        )
    )
    if not user:
        session.add(
            PilotUserRecord(
                organization_id=organization.id,
                email=email,
                role="OWNER",
                active=True,
                created_at=now,
            )
        )


def _ensure_connection(
    session: Session,
    organization: OrganizationRecord,
    spec: dict[str, object],
    now: datetime,
) -> None:
    connection = session.scalar(
        select(RobloxConnectionRecord).where(
            RobloxConnectionRecord.organization_id == organization.id,
            RobloxConnectionRecord.universe_id == str(spec["universe_id"]),
        )
    )
    if connection:
        connection.experience_name = str(spec["experience_name"])
        connection.active = True
        connection.updated_at = now
        return
    session.add(
        RobloxConnectionRecord(
            organization_id=organization.id,
            universe_id=str(spec["universe_id"]),
            experience_name=str(spec["experience_name"]),
            encrypted_api_key="SIMULATION_ONLY_NO_CREDENTIAL",
            active=True,
            created_at=now,
            updated_at=now,
        )
    )


def _observation(
    organization_id: int,
    universe_id: str,
    metric: str,
    observed_at: datetime,
    value: float,
    ingested_at: datetime,
    dimensions: dict[str, str] | None = None,
) -> MetricObservationRecord:
    dimensions = dimensions or {}
    dimensions_json = json.dumps(dimensions, sort_keys=True)
    return MetricObservationRecord(
        organization_id=organization_id,
        universe_id=universe_id,
        metric=metric,
        observed_at=observed_at,
        value=float(value),
        dimensions_json=dimensions_json,
        dimensions_key=dimensions_json if dimensions else "",
        status="simulated",
        ingested_at=ingested_at,
    )


def _seed_metrics(
    session: Session,
    organization: OrganizationRecord,
    spec: dict[str, object],
    now: datetime,
) -> int:
    session.execute(
        delete(MetricObservationRecord).where(
            MetricObservationRecord.organization_id == organization.id
        )
    )
    universe_id = str(spec["universe_id"])
    end = now.replace(hour=12, minute=0, second=0, microsecond=0)
    rows: list[MetricObservationRecord] = []
    for offset in range(89, -1, -1):
        observed_at = end - timedelta(days=offset)
        is_current = offset == 0
        wave = math.sin((89 - offset) / 5.0)
        dau = float(spec["current_dau"] if is_current else float(spec["baseline_dau"]) * (1 + wave * 0.025))
        revenue = float(
            spec["current_revenue"]
            if is_current
            else float(spec["baseline_revenue"]) * (1 + wave * 0.018)
        )
        mobile_d1 = float(
            spec["current_mobile_d1"]
            if is_current
            else float(spec["baseline_mobile_d1"]) + wave * 0.004
        )
        desktop_d1 = float(
            spec["current_desktop_d1"]
            if is_current
            else float(spec["baseline_desktop_d1"]) + wave * 0.003
        )
        d7 = float(spec["current_d7"] if is_current else float(spec["baseline_d7"]) + wave * 0.002)
        rows.extend(
            [
                _observation(organization.id, universe_id, "DailyActiveUsers", observed_at, round(dau), now),
                _observation(organization.id, universe_id, "DailyRevenue", observed_at, round(revenue, 2), now),
                _observation(
                    organization.id,
                    universe_id,
                    "ForwardD1Retention",
                    observed_at,
                    round(mobile_d1, 4),
                    now,
                    {"device": "mobile"},
                ),
                _observation(
                    organization.id,
                    universe_id,
                    "ForwardD1Retention",
                    observed_at,
                    round(desktop_d1, 4),
                    now,
                    {"device": "desktop"},
                ),
                _observation(organization.id, universe_id, "ForwardD7Retention", observed_at, round(d7, 4), now),
            ]
        )
    session.add_all(rows)
    return len(rows)


def _seed_feedback(session: Session, organization: OrganizationRecord, message: str, now: datetime) -> None:
    existing = session.scalar(
        select(PilotFeedbackRecord).where(
            PilotFeedbackRecord.organization_id == organization.id,
            PilotFeedbackRecord.category == "simulation",
        )
    )
    if existing:
        existing.message = message
        existing.usefulness_score = 5
        existing.created_at = now
        return
    session.add(
        PilotFeedbackRecord(
            organization_id=organization.id,
            category="simulation",
            message=message,
            usefulness_score=5,
            created_at=now,
        )
    )


def _new_invite(session: Session, organization: OrganizationRecord, email: str, now: datetime) -> str:
    raw_token = new_opaque_token()
    session.add(
        PilotInviteRecord(
            organization_id=organization.id,
            email=email,
            role="OWNER",
            token_hash=hash_token(raw_token),
            expires_at=invite_expiry(),
            redeemed_at=None,
            created_at=now,
        )
    )
    return raw_token


@router.post("/seed")
def seed_simulations(session: SessionDep, _: AdminDep) -> dict[str, object]:
    now = datetime.now(UTC)
    result = []
    for spec in SIMULATIONS:
        organization = _ensure_org(session, spec, now)
        owner_email = str(spec["owner_email"])
        _ensure_user(session, organization, owner_email, now)
        _ensure_connection(session, organization, spec, now)
        observation_count = _seed_metrics(session, organization, spec, now)
        _seed_feedback(session, organization, str(spec["feedback"]), now)
        invite_token = _new_invite(session, organization, owner_email, now)
        result.append(
            {
                "organization_id": organization.id,
                "name": organization.name,
                "slug": organization.slug,
                "data_mode": organization.data_mode,
                "universe_id": str(spec["universe_id"]),
                "experience_name": str(spec["experience_name"]),
                "observations": observation_count,
                "invite_token": invite_token,
            }
        )
    session.commit()
    return {"seeded_at": now, "studios": result, "note": "All generated data is explicitly SIMULATED."}
