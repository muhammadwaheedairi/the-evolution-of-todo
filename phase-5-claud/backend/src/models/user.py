"""User model and related schemas."""

from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr
import re

if TYPE_CHECKING:
    from .task import Task
    from .conversation import Conversation


def validate_email(email: str) -> str:
    """Validate email format using regex."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError("Invalid email format")
    return email.lower().strip()


class UserBase(SQLModel):
    """Base model for user with common fields."""
    name: str = Field(max_length=100)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)


class User(UserBase, table=True):
    """User model for the database."""
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="owner", cascade_delete=False)
    conversations: List["Conversation"] = Relationship(back_populates="owner", cascade_delete=True)


class UserCreate(UserBase):
    """Model for creating a new user."""
    name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=8)

    def __init__(self, **data):
        super().__init__(**data)
        self.email = validate_email(self.email)


class UserRead(UserBase):
    """Model for reading user data (without password)."""
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime


class UserUpdate(SQLModel):
    """Model for updating user data."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=8)

    def __init__(self, **data):
        super().__init__(**data)
        if self.email:
            self.email = validate_email(self.email)


class UserLogin(SQLModel):
    """Model for user login."""
    email: EmailStr
    password: str = Field(min_length=8)

    def __init__(self, **data):
        super().__init__(**data)
        self.email = validate_email(self.email)