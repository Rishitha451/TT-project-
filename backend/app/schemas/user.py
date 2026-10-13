"""User Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user properties."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=512)
    currency: str = Field(default="INR", max_length=10)


class UserCreate(UserBase):
    """Schema for creating a user."""
    pass


class UserUpdate(BaseModel):
    """Schema for updating user profile fields."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=512)
    currency: Optional[str] = Field(default=None, max_length=10)
    is_active: Optional[bool] = None


class UserRead(UserBase):
    """Schema for reading user details."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
