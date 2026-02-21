"""Event schemas for Kafka messages."""

from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class TaskEventData(BaseModel):
    """Task data in events."""
    title: str
    description: Optional[str] = None
    priority: str
    tags: Optional[str] = None
    due_date: Optional[str] = None
    recurrence_pattern: Optional[str] = None
    completed: bool = False


class TaskEvent(BaseModel):
    """Task event published to Kafka."""
    event_type: Literal["created", "updated", "completed", "deleted"]
    task_id: int
    user_id: str
    task_data: TaskEventData
    timestamp: str


class ReminderEvent(BaseModel):
    """Reminder event for notification service."""
    task_id: int
    user_id: str
    title: str
    due_at: str
    remind_at: str
    priority: str


class TaskUpdateEvent(BaseModel):
    """Real-time update event for WebSocket."""
    task_id: int
    user_id: str
    action: Literal["created", "updated", "deleted", "completed"]
    timestamp: str