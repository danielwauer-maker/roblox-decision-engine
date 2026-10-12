from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://rde:rde_dev@localhost:5432/roblox_decision_engine"
    roblox_analytics_base_url: str = "https://apis.roblox.com/analytics-query-api"
    roblox_universe_id: str | None = None
    roblox_api_key: SecretStr | None = None
    openai_api_base_url: str = "https://api.openai.com/v1"
    openai_api_key: SecretStr | None = None
    openai_model: str = "gpt-6-luna"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
