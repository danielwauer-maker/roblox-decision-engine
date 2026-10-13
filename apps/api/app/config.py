from functools import lru_cache

from pydantic import SecretStr
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
    stripe_price_indie: str | None = None
    stripe_price_growth: str | None = None
    stripe_price_studio: str | None = None
    stripe_webhook_tolerance_seconds: int = 300

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def public_origin(self) -> str:
        return self.public_app_url.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
