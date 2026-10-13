"""Authentication and authorization schemas."""

from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    """Schema for user registration / signup."""
    email: EmailStr = Field(..., description="User's unique email address")
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password (minimum 8 characters)",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="User display / full name",
    )
    currency: Optional[str] = Field(
        default="INR",
        max_length=10,
        description="Preferred account currency (default INR)",
    )


class LoginRequest(BaseModel):
    """Schema for user authentication / login."""
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")


class TokenResponse(BaseModel):
    """Schema for successful authentication response with JWT access token."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead


class AuthResponse(BaseModel):
    """Schema matching frontend AuthResponse contract."""
    user: UserRead
    token: str
