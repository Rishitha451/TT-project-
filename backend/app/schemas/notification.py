"""Notification Pydantic schemas."""

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class NotificationBase(BaseModel):
    """Base notification properties."""
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    type: Literal["alert", "insight", "goal", "system"] = "alert"
    link: Optional[str] = Field(default=None, max_length=512)


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    pass


class NotificationUpdate(BaseModel):
    """Schema for updating a notification state."""
    is_read: Optional[bool] = Field(default=None, alias="read")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class NotificationRead(BaseModel):
    """Schema for reading notification details matching frontend NotificationItem contract."""
    id: str
    user_id: str
    title: str
    message: str
    time: str
    read: bool
    type: str
    link: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)
