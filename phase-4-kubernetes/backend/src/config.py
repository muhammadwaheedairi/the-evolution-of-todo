"""Application configuration using Pydantic settings."""

from pydantic_settings import BaseSettings
from typing import List
from datetime import timedelta


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database settings
    DATABASE_URL: str

    # Auth settings
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ACCESS_TOKEN_EXPIRE_DELTA: timedelta = timedelta(days=7)

    # OpenAI/OpenRouter settings - Phase 3
    OPENROUTER_API_KEY: str
    OPENAI_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENAI_MODEL: str = "openai/gpt-oss-120b:free"

    # App settings
    APP_NAME: str = "Todo AI Chatbot"
    APP_VERSION: str = "0.2.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # CORS settings
    BACKEND_CORS_ORIGINS: str = "*"

    # Security settings
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_TIME: int = 300

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "100/hour"

    # API settings
    API_V1_STR: str = "/api"
    USERS_OPENAPI_TAG: str = "users"
    TASKS_OPENAPI_TAG: str = "tasks"
    AUTH_OPENAPI_TAG: str = "auth"
    CHAT_OPENAPI_TAG: str = "chat"  # Phase 3

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


# Global settings instance
settings = Settings()


def get_backend_cors_origins() -> List[str]:
    """Parse CORS origins from comma-separated string."""
    if settings.BACKEND_CORS_ORIGINS == "*":
        return ["*"]
    origins = settings.BACKEND_CORS_ORIGINS.split(",")
    return [origin.strip() for origin in origins if origin.strip()]