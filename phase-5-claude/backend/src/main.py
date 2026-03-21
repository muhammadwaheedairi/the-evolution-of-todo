="""FastAPI application entry point."""

from contextlib import asynccontextmanager
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings, get_backend_cors_origins
from .database import init_db
from .routers import auth, tasks, chat, health, notifications, internal
from .events.publisher import kafka_publisher
from .events.websocket import socket_app
from .events.consumer import start_kafka_consumer, stop_kafka_consumer
from .events.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    logger.info("🚀 Starting application...")
    init_db()

    if settings.KAFKA_ENABLED:
        # Kafka publisher
        try:
            await kafka_publisher.start()
            logger.info("✅ Kafka publisher started")
        except Exception as e:
            logger.warning(f"⚠️ Kafka publisher failed to start: {e}")

        # Notification consumer (was separate notification-service)
        try:
            await start_kafka_consumer()
            logger.info("✅ Kafka consumer started")
        except Exception as e:
            logger.warning(f"⚠️ Kafka consumer failed to start: {e}")

        # Reminder scheduler (was separate reminder-service)
        try:
            await start_scheduler()
            logger.info("✅ Reminder scheduler started")
        except Exception as e:
            logger.warning(f"⚠️ Reminder scheduler failed to start: {e}")

    yield

    logger.info("🛑 Shutting down application...")
    if settings.KAFKA_ENABLED:
        await kafka_publisher.stop()
        logger.info("✅ Kafka publisher stopped")
        await stop_kafka_consumer()
        logger.info("✅ Kafka consumer stopped")
        await stop_scheduler()
        logger.info("✅ Reminder scheduler stopped")


# ── INTERNAL SUB-APP ───────────────────────────────────────────────────
internal_app = FastAPI(title="Internal API", docs_url=None)

internal_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

internal_app.include_router(internal.router)


# ── MAIN APP ───────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Mount WebSocket
app.mount("/ws", socket_app)

# Mount internal sub-app
app.mount("/api/internal", internal_app)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_backend_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=[settings.AUTH_OPENAPI_TAG])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=[settings.TASKS_OPENAPI_TAG])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=[settings.CHAT_OPENAPI_TAG])
app.include_router(notifications.router, prefix=settings.API_V1_STR, tags=["notifications"])


@app.get("/")
def read_root():
    return {
        "message": "Todo AI Chatbot API - Phase 5 (Kafka)",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }