from __future__ import annotations

from collections.abc import Mapping

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.email_models import EmailTemplateRecord

DEFAULT_EMAIL_TEMPLATES: tuple[dict[str, str], ...] = (
    {
        "key": "PILOT_APPLICATION_RECEIVED",
        "name": "Pilot application · customer confirmation",
        "category": "acquisition",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
    {
        "key": "PILOT_APPLICATION_OPERATOR",
        "name": "Pilot application · operator alert",
        "category": "acquisition",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
    {
        "key": "WORKSPACE_INVITE",
        "name": "Workspace invitation",
        "category": "authentication",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
    {
        "key": "PASSWORDLESS_LOGIN",
        "name": "Passwordless sign-in",
        "category": "authentication",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
    {
        "key": "ANALYTICS_STALE",
        "name": "Analytics data is stale",
        "category": "operations",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
    {
        "key": "EXPERIMENT_READY",
        "name": "Experiment ready",
        "category": "lifecycle",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
    {
        "key": "WEEKLY_BRIEF_READY",
        "name": "Weekly Brief",
        "category": "lifecycle",
        "subject": "{{default_subject}}",
        "body_html": "{{default_body}}",
    },
)


def _render(value: str, variables: Mapping[str, object]) -> str:
    result = value
    for key, raw in variables.items():
        result = result.replace("{{" + key + "}}", str(raw if raw is not None else ""))
    return result


def resolve_notification_template(
    session: Session,
    *,
    kind: str,
    fallback_subject: str,
    fallback_body_html: str,
    recipient: str,
    organization_id: int | None,
) -> tuple[str, str]:
    template = session.scalar(
        select(EmailTemplateRecord).where(
            EmailTemplateRecord.key == kind,
            EmailTemplateRecord.active.is_(True),
        )
    )
    if template is None:
        return fallback_subject, fallback_body_html

    variables = {
        "default_subject": fallback_subject,
        "default_body": fallback_body_html,
        "recipient": recipient,
        "organization_id": organization_id or "",
    }
    return _render(template.subject, variables), _render(template.body_html, variables)


def template_catalog(session: Session) -> list[dict[str, object]]:
    persisted = {
        row.key: row
        for row in session.scalars(select(EmailTemplateRecord).order_by(EmailTemplateRecord.key)).all()
    }
    catalog: list[dict[str, object]] = []
    known_keys: set[str] = set()
    for default in DEFAULT_EMAIL_TEMPLATES:
        key = default["key"]
        known_keys.add(key)
        row = persisted.get(key)
        catalog.append(
            {
                "key": key,
                "name": row.name if row else default["name"],
                "category": row.category if row else default["category"],
                "subject": row.subject if row else default["subject"],
                "body_html": row.body_html if row else default["body_html"],
                "active": row.active if row else False,
                "customized": row is not None,
                "updated_at": row.updated_at if row else None,
            }
        )
    for key, row in persisted.items():
        if key in known_keys:
            continue
        catalog.append(
            {
                "key": key,
                "name": row.name,
                "category": row.category,
                "subject": row.subject,
                "body_html": row.body_html,
                "active": row.active,
                "customized": True,
                "updated_at": row.updated_at,
            }
        )
    return catalog
