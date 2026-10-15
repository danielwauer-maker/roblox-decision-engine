from functools import lru_cache

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://rde:rde_dev@localhost:5432/roblox_decision_engine"
    public_app_url: str = "http://localhost:3000"
    roblox_analytics_base_url: str = "https://apis.roblox.com/analytics-query-api"
    roblox_universe_id: str | None = None
    roblox_api_key: SecretStr | None = None
    openai_api_base_url: str = "https://api.openai.com/v1"
    openai_api_key: SecretStr | None = None
    openai_model: str = "gpt-6-luna"
    cors_origins: str = "http://localhost:3000"
    write_rate_limit_per_minute: int = 60
    external_request_timeout_seconds: float = 15.0
    external_retry_attempts: int = 3
    external_retry_backoff_seconds: float = 0.25
    pilot_admin_token: SecretStr | None = None
    pilot_credential_key: SecretStr | None = None
    pilot_session_hours: int = 24 * 35
    pilot_invite_hours: int = 72
    pilot_login_link_minutes: int = 20

    resend_api_key: SecretStr | None = None
    email_from: str = "PlayDirective <pilot@playdirective.com>"
    operator_email: str | None = None
    lifecycle_stale_days: int = 7

    stripe_secret_key: SecretStr | None = None
    stripe_webhook_secret: SecretStr | None = None
    stripe_portal_configuration_id: str | None = None
    stripe_managed_payments_enabled: bool = False
    stripe_mode: str = "test"
    stripe_test_billing_mode: bool = False
    playdirective_commercial_mode: str = "pilot"
    stripe_price_indie_personal: str | None = None
    stripe_price_indie_business: str | None = None
    stripe_price_growth_personal: str | None = None
    stripe_price_growth_business: str | None = None
    stripe_price_studio_personal: str | None = None
    stripe_price_studio_business: str | None = None
    stripe_webhook_tolerance_seconds: int = 300

    @model_validator(mode="after")
    def validate_stripe_mode_safety(self) -> "Settings":
        mode = self.stripe_mode.strip().lower()
        environment = self.app_env.strip().lower()
        key = self.stripe_secret_key.get_secret_value() if self.stripe_secret_key else ""
        if mode not in {"test", "live"}:
            raise ValueError("STRIPE_MODE must be either 'test' or 'live'")
        object.__setattr__(self, "stripe_mode", mode)
        object.__setattr__(self, "app_env", environment)
        if self.stripe_test_billing_mode and mode != "test":
            raise ValueError("STRIPE_TEST_BILLING_MODE is only valid with STRIPE_MODE=test")
        if self.stripe_test_billing_mode and self.stripe_managed_payments_enabled:
            raise ValueError("STRIPE_TEST_BILLING_MODE and STRIPE_MANAGED_PAYMENTS_ENABLED cannot both be enabled")
        if environment == "production" and self.stripe_test_billing_mode:
            raise ValueError("STRIPE_TEST_BILLING_MODE cannot be enabled in production")
        if environment == "production" and mode != "live":
            raise ValueError("Production requires STRIPE_MODE=live; test mode is refused")
        if key:
            if mode == "test" and not key.startswith(("sk_test_", "rk_test_")):
                raise ValueError("STRIPE_MODE=test requires a Stripe test-mode secret or restricted key")
            if mode == "live" and not key.startswith(("sk_live_", "rk_live_")):
                raise ValueError("STRIPE_MODE=live requires a Stripe live secret or restricted key")
        if environment == "production" and self.stripe_managed_payments_enabled:
            required = {
                "STRIPE_SECRET_KEY": key,
                "STRIPE_WEBHOOK_SECRET": self.stripe_webhook_secret,
                "STRIPE_PORTAL_CONFIGURATION_ID": self.stripe_portal_configuration_id,
                "STRIPE_PRICE_INDIE_PERSONAL": self.stripe_price_indie_personal,
                "STRIPE_PRICE_INDIE_BUSINESS": self.stripe_price_indie_business,
                "STRIPE_PRICE_GROWTH_PERSONAL": self.stripe_price_growth_personal,
                "STRIPE_PRICE_GROWTH_BUSINESS": self.stripe_price_growth_business,
                "STRIPE_PRICE_STUDIO_PERSONAL": self.stripe_price_studio_personal,
                "STRIPE_PRICE_STUDIO_BUSINESS": self.stripe_price_studio_business,
            }
            missing = [name for name, value in required.items() if not value]
            if missing:
                raise ValueError(
                    "Production Managed Payments requires all Stripe secrets and six live Prices: "
                    + ", ".join(missing)
                )
        return self

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def stripe_billing_enabled(self) -> bool:
        if not self.stripe_secret_key:
            return False
        if self.stripe_mode == "test":
            return self.stripe_test_billing_mode or self.stripe_managed_payments_enabled
        return (
            self.app_env.lower() == "production"
            and self.stripe_managed_payments_enabled
            and not self.stripe_test_billing_mode
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def public_origin(self) -> str:
        return self.public_app_url.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
