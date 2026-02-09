"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings, get_backend_cors_origins
from .database import init_db  # Changed from create_db_and_tables
from .routers import auth, tasks, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    # Startup code
    init_db()  # Changed from create_db_and_tables()
    yield
    # Shutdown code (optional, add here if needed)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan  # Use lifespan instead of deprecated @on_event
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_backend_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=[settings.AUTH_OPENAPI_TAG])
app.include_router(tasks.router, prefix=settings.API_V1_STR, tags=[settings.TASKS_OPENAPI_TAG])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=[settings.CHAT_OPENAPI_TAG])


@app.get("/")
def read_root():
    return {
        "message": "Todo AI Chatbot API - Phase 3",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "phase": "3"}
