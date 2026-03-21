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
    OPENAI_MODEL: str = "arcee-ai/trinity-large-preview:free"

    # Kafka settings - Phase 5
    KAFKA_BOOTSTRAP_SERVERS: str = "taskflow-redpanda:9092"
    KAFKA_ENABLED: bool = True

    # Internal service settings
    INTERNAL_SECRET: str = "internal-service-secret-2026"

    # SMTP settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "taskflow.reminders@gmail.com"
    SMTP_FROM_NAME: str = "TaskFlow Reminders"

    # App settings
    APP_NAME: str = "Todo AI Chatbot"
    APP_VERSION: str = "0.3.0"
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
    CHAT_OPENAPI_TAG: str = "chat"

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
