from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID


class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    name: str = Field(min_length=1, max_length=100)  # ✅ ADDED - First field
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RegisterResponse(BaseModel):
    """Response schema for user registration."""
    id: UUID
    name: str  # ✅ ADDED
    email: EmailStr
    message: str = "Account created successfully"


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginResponse(BaseModel):
    """Response schema for user login."""
    access_token: str
    token_type: str = "bearer"
    user: dict  # Will include: id, name, email  # ✅ UPDATED COMMENT


class TokenData(BaseModel):
    """Schema for JWT token data."""
    user_id: str
    email: Optional[str] = None


class AuthenticatedUser(BaseModel):
    """Schema for authenticated user data."""
    id: UUID
    name: str  # ✅ ADDED
    email: EmailStr


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh."""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Response schema for token refresh."""
    access_token: str
    token_type: str = "bearer"


class ChangePasswordRequest(BaseModel):
    """Request schema for changing password."""
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request schema for resetting password."""
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class UserProfileResponse(BaseModel):
    """Response schema for user profile."""
    id: UUID
    name: str  # ✅ ADDED
    email: EmailStr
    created_at: str
    updated_at: str


class UpdateProfileRequest(BaseModel):
    """Request schema for updating user profile."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)  # ✅ ADDED
    email: Optional[EmailStr] = None