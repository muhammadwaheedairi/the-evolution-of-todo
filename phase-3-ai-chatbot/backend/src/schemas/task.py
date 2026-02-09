from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class TaskBase(BaseModel):
    """Base schema for task with common fields."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskUpdateStatus(BaseModel):
    """Schema for updating task completion status."""
    completed: bool


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    user_id: UUID
    completed: bool
    created_at: datetime
    updated_at: datetime
    
    # Allow conversion from ORM models
    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    """Schema for task list response."""
    tasks: List[TaskResponse]


class TaskDeleteResponse(BaseModel):
    """Schema for task deletion response."""
    message: str = "Task deleted successfully"


class TaskToggleCompletionRequest(BaseModel):
    """Schema for toggling task completion status."""
    completed: bool


class TaskToggleCompletionResponse(BaseModel):
    """Schema for toggling task completion response."""
    id: int
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime
    
    # Allow conversion from ORM models
    model_config = ConfigDict(from_attributes=True)