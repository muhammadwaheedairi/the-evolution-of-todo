from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from pydantic import validator

if TYPE_CHECKING:
    from .user import User


class TaskBase(SQLModel):
    """Base model for task with common fields."""
    title: str = Field(min_length=1, max_length=200, sa_column_kwargs={"name": "title"})
    description: Optional[str] = Field(default=None, max_length=1000, sa_column_kwargs={"name": "description"})
    completed: bool = Field(default=False, sa_column_kwargs={"name": "completed"})


class Task(TaskBase, table=True):
    """Task model for the database."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user (NOT stored in database)
    owner: Optional["User"] = Relationship(back_populates="tasks")


class TaskCreate(TaskBase):
    """Model for creating a new task."""
    title: str = Field(min_length=1, max_length=200)


class TaskRead(TaskBase):
    """Model for reading task data."""
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class TaskUpdate(SQLModel):
    """Model for updating task data."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None

    @validator('title')
    def validate_title(cls, v):
        if v is not None and len(v) < 1:
            raise ValueError('Title must be at least 1 character long')
        if v is not None and len(v) > 200:
            raise ValueError('Title must be at most 200 characters long')
        return v


class TaskUpdateStatus(SQLModel):
    """Model for updating task completion status."""
    completed: bool