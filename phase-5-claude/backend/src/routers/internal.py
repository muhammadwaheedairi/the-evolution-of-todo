"""Internal endpoints for service-to-service communication."""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from datetime import datetime, timedelta
from uuid import UUID
import os

from ..database import engine
from ..models.task import Task

router = APIRouter()

INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "internal-service-secret-2026")


@router.get("/tasks/due-soon")
async def get_due_soon_tasks(request: Request, minutes: int = 30):
    """Tasks due within next N minutes - used by reminder service."""
    secret = request.headers.get("x-internal-secret")
    if secret != INTERNAL_SECRET:
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})

    now = datetime.utcnow()
    soon = now + timedelta(minutes=minutes)

    with Session(engine) as session:
        tasks_list = session.exec(
            select(Task).where(
                Task.due_date >= now,
                Task.due_date <= soon,
                Task.completed == False
            )
        ).all()

    return {
        "tasks": [
            {
                "id": t.id,
                "user_id": str(t.user_id),
                "title": t.title,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "priority": t.priority
            }
            for t in tasks_list
        ],
        "count": len(tasks_list),
        "checked_at": now.isoformat()
    }


@router.get("/users/{user_id}/email")
async def get_user_email(request: Request, user_id: str):
    """Get user email - used by notification service."""
    from ..models.user import User

    secret = request.headers.get("x-internal-secret")
    if secret != INTERNAL_SECRET:
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})

    with Session(engine) as session:
        user = session.get(User, UUID(user_id))
        if not user:
            return JSONResponse(status_code=404, content={"detail": "User not found"})

    return {"email": user.email, "name": user.name}


@router.get("/health")
async def internal_health():
    return {"status": "healthy", "service": "internal"}