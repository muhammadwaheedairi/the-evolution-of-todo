"""Chat request/response schemas."""

from pydantic import BaseModel, Field
from typing import List


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's message to the AI assistant"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Add a task to buy groceries"
            }
        }


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""

    conversation_id: str = Field(
        ...,
        description="Unique identifier for the conversation session"
    )

    response: str = Field(
        ...,
        description="AI assistant's response message"
    )

    tool_calls: List[str] = Field(
        default_factory=list,
        description="List of tools that were executed by the agent"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "user_123e4567-e89b-12d3-a456-426614174000",
                "response": "✅ Created task #1: 'Buy groceries'",
                "tool_calls": ["add_task"]
            }
        }