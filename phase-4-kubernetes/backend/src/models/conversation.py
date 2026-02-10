"""Conversation and Message models for chat history."""

from sqlmodel import SQLModel, Field, Relationship, Column, Text
from uuid import UUID
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Text as SQLText  # ✅ Import this

if TYPE_CHECKING:
    from .user import User


class Conversation(SQLModel, table=True):
    """Conversation model for tracking chat sessions."""
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    owner: Optional["User"] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation", cascade_delete=True)


class Message(SQLModel, table=True):
    """Message model for storing individual chat messages."""
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str = Field(sa_column=Column(SQLText))  # ✅ FIXED
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")