"""User settings, profile, and preferences Pydantic schemas."""

from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class UserProfileBase(BaseModel):
    """Base profile schema."""
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class UserProfileRead(BaseModel):
    """Profile fields for a user."""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    bio: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)


class UserPreferencesBase(BaseModel):
    """Base preferences schema."""
    currency: Literal["INR", "USD", "EUR", "GBP"] = "INR"
    theme: Literal["light", "dark", "system"] = "dark"
    email_alerts: bool = Field(default=True, alias="emailAlerts")
    push_notifications: bool = Field(default=True, alias="pushNotifications")
    weekly_digest: bool = Field(default=True, alias="weeklyDigest")
    investment_alerts: bool = Field(default=True, alias="investmentAlerts")


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile fields."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=512, alias="avatarUrl")
    phone: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class UserPreferencesRead(BaseModel):
    """Preferences fields matching frontend UserPreferences contract."""
    currency: Literal["INR", "USD", "EUR", "GBP"] = "INR"
    theme: Literal["light", "dark", "system"] = "dark"
    email_alerts: bool = Field(default=True, alias="emailAlerts")
    push_notifications: bool = Field(default=True, alias="pushNotifications")
    weekly_digest: bool = Field(default=True, alias="weeklyDigest")
    investment_alerts: bool = Field(default=True, alias="investmentAlerts")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    currency: Optional[Literal["INR", "USD", "EUR", "GBP"]] = None
    theme: Optional[Literal["light", "dark", "system"]] = None
    email_alerts: Optional[bool] = Field(default=None, alias="emailAlerts")
    push_notifications: Optional[bool] = Field(default=None, alias="pushNotifications")
    weekly_digest: Optional[bool] = Field(default=None, alias="weeklyDigest")
    investment_alerts: Optional[bool] = Field(default=None, alias="investmentAlerts")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class UserSettingsRead(BaseModel):
    """Unified user settings response schema matching frontend UserSettings."""
    profile: UserProfileRead
    preferences: UserPreferencesRead

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class UserSettingsUpdate(BaseModel):
    """Schema for updating combined settings."""
    profile: Optional[UserProfileUpdate] = None
    preferences: Optional[UserPreferencesUpdate] = None
