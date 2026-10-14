from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models import RobloxConnectionRecord


def active_connections_for_organization(
    session: Session,
    organization_id: int,
) -> list[RobloxConnectionRecord]:
    return list(
        session.scalars(
            select(RobloxConnectionRecord)
            .where(
                RobloxConnectionRecord.organization_id == organization_id,
                RobloxConnectionRecord.active.is_(True),
            )
            .order_by(
                desc(RobloxConnectionRecord.updated_at),
                desc(RobloxConnectionRecord.id),
            )
        ).all()
    )


def entitled_connections_for_organization(
    session: Session,
    organization_id: int,
    experience_limit: int,
) -> list[RobloxConnectionRecord]:
    if experience_limit <= 0:
        return []
    return active_connections_for_organization(session, organization_id)[:experience_limit]


def entitled_connection_ids(
    session: Session,
    organization_id: int,
    experience_limit: int,
) -> set[int]:
    return {
        row.id
        for row in entitled_connections_for_organization(
            session,
            organization_id,
            experience_limit,
        )
    }
