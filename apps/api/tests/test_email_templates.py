from datetime import UTC, datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base
from app.email_models import EmailTemplateRecord
from app.services.email_templates import resolve_notification_template, template_catalog


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def test_inactive_or_missing_template_keeps_production_fallback():
    session = _session()
    subject, body = resolve_notification_template(
        session,
        kind="WORKSPACE_INVITE",
        fallback_subject="Default subject",
        fallback_body_html="<p>Default body</p>",
        recipient="owner@example.com",
        organization_id=42,
    )
    assert subject == "Default subject"
    assert body == "<p>Default body</p>"


def test_active_template_can_wrap_dynamic_production_content():
    session = _session()
    now = datetime.now(UTC)
    session.add(
        EmailTemplateRecord(
            key="WORKSPACE_INVITE",
            name="Workspace invitation",
            category="authentication",
            subject="PlayDirective · {{default_subject}}",
            body_html="<p>Hello {{recipient}}</p>{{default_body}}<p>Org {{organization_id}}</p>",
            active=True,
            created_at=now,
            updated_at=now,
        )
    )
    session.commit()

    subject, body = resolve_notification_template(
        session,
        kind="WORKSPACE_INVITE",
        fallback_subject="Your workspace is ready",
        fallback_body_html='<p><a href="https://example.test/invite">Open workspace</a></p>',
        recipient="owner@example.com",
        organization_id=42,
    )
    assert subject == "PlayDirective · Your workspace is ready"
    assert "owner@example.com" in body
    assert "https://example.test/invite" in body
    assert "Org 42" in body


def test_catalog_exposes_known_templates_before_customization():
    session = _session()
    keys = {item["key"] for item in template_catalog(session)}
    assert "PILOT_APPLICATION_RECEIVED" in keys
    assert "WORKSPACE_INVITE" in keys
    assert "PASSWORDLESS_LOGIN" in keys
    assert "WEEKLY_BRIEF_READY" in keys
