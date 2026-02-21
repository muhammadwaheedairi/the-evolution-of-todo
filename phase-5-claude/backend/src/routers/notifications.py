"""Notifications router for WebSocket integration."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import logging

from ..events.websocket import send_notification_to_user

logger = logging.getLogger(__name__)

router = APIRouter()


class NotificationRequest(BaseModel):
    """Notification request model."""
    user_id: str
    notification: Dict[str, Any]


@router.post("/notifications/send")
async def send_notification(request: NotificationRequest):
    """Send notification via WebSocket to user."""
    try:
        await send_notification_to_user(request.user_id, request.notification)
        return {"status": "sent", "user_id": request.user_id}
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notifications/health")
async def notification_health():
    """Health check for notification system."""
    return {"status": "healthy", "service": "notifications"}