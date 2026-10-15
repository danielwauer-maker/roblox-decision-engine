import pytest
from pydantic import ValidationError

from app.config import Settings


def settings(**overrides):
    return Settings(_env_file=None, **overrides)


def test_test_billing_mode_is_available_only_with_sandbox_mode():
    config = settings(
        stripe_mode="test",
        stripe_test_billing_mode=True,
        stripe_secret_key="sk_test_example",
    )

    assert config.stripe_billing_enabled is True
    assert config.stripe_managed_payments_enabled is False


@pytest.mark.parametrize(
    "overrides",
    [
        {"stripe_mode": "live", "stripe_test_billing_mode": True},
        {
            "stripe_mode": "test",
            "stripe_test_billing_mode": True,
            "stripe_managed_payments_enabled": True,
        },
        {"stripe_mode": "test", "stripe_secret_key": "sk_live_example"},
        {"stripe_mode": "live", "stripe_secret_key": "sk_test_example"},
        {
            "app_env": "production",
            "stripe_mode": "live",
            "stripe_test_billing_mode": True,
        },
        {"app_env": "production", "stripe_mode": "test"},
    ],
)
def test_incompatible_or_unsafe_stripe_modes_are_rejected(overrides):
    with pytest.raises(ValidationError):
        settings(**overrides)


def test_production_defaults_are_live_and_test_billing_disabled():
    config = settings(app_env="production", stripe_mode="live")

    assert config.stripe_test_billing_mode is False
    assert config.stripe_managed_payments_enabled is False
    assert config.stripe_billing_enabled is False


def test_production_managed_payments_requires_complete_live_configuration():
    prices = {
        "stripe_price_indie_personal": "price_indie_personal",
        "stripe_price_indie_business": "price_indie_business",
        "stripe_price_growth_personal": "price_growth_personal",
        "stripe_price_growth_business": "price_growth_business",
        "stripe_price_studio_personal": "price_studio_personal",
        "stripe_price_studio_business": "price_studio_business",
    }
    config = settings(
        app_env="production",
        stripe_mode="live",
        stripe_managed_payments_enabled=True,
        stripe_secret_key="sk_live_example",
        stripe_webhook_secret="whsec_live_example",
        stripe_portal_configuration_id="bpc_live_example",
        **prices,
    )

    assert config.stripe_billing_enabled is True

    with pytest.raises(ValidationError):
        settings(
            app_env="production",
            stripe_mode="live",
            stripe_managed_payments_enabled=True,
            stripe_secret_key="sk_live_example",
        )
