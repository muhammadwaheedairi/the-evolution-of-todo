from pydantic_settings import BaseSettings
from typing import Optional
from datetime import timedelta
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database settings
    DATABASE_URL: str

    # Auth settings
    BETTER_AUTH_SECRET: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ACCESS_TOKEN_EXPIRE_DELTA: timedelta = timedelta(days=7)

    # App settings
    APP_NAME: str = "Todo Full-Stack Web Application"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # CORS settings
    BACKEND_CORS_ORIGINS: str = "*"  # In production, specify exact origins

    # Security settings
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_TIME: int = 300  # 5 minutes in seconds

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "100/hour"

    # API settings
    API_V1_STR: str = "/api"
    USERS_OPENAPI_TAG: str = "users"
    TASKS_OPENAPI_TAG: str = "tasks"
    AUTH_OPENAPI_TAG: str = "auth"

    model_config = {"env_file": ".env", "case_sensitive": True, "extra": "ignore"}


# Create settings instance
settings = Settings()


def get_backend_cors_origins():
    """Parse the BACKEND_CORS_ORIGINS setting into a list."""
    origins = settings.BACKEND_CORS_ORIGINS.split(",")
    return [origin.strip() for origin in origins if origin.strip()]