"""Financial goal Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class GoalBase(BaseModel):
    """Base goal properties matching frontend Goal interface."""
    name: str = Field(..., min_length=1, max_length=255)
    target: Decimal = Field(..., gt=0, decimal_places=4, alias="target_amount")
    current: Decimal = Field(default=Decimal("0.0000"), ge=0, decimal_places=4, alias="current_amount")
    color: str = Field(default="#3B82F6", max_length=50)
    category: Optional[str] = Field(default=None, max_length=100)
    target_date: Optional[datetime] = Field(default=None, alias="targetDate")
    status: Literal["in_progress", "completed", "archived"] = "in_progress"

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class GoalCreate(BaseModel):
    """Schema for creating a goal."""
    name: str = Field(..., min_length=1, max_length=255)
    target: Optional[Decimal] = Field(default=None, gt=0, decimal_places=4)
    target_amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=4)
    current: Optional[Decimal] = Field(default=Decimal("0.0000"), ge=0, decimal_places=4)
    current_amount: Optional[Decimal] = Field(default=None, ge=0, decimal_places=4)
    color: str = Field(default="#3B82F6", max_length=50)
    category: Optional[str] = Field(default=None, max_length=100)
    target_date: Optional[datetime] = Field(default=None, alias="targetDate")
    status: Literal["in_progress", "completed", "archived"] = "in_progress"

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class GoalUpdate(BaseModel):
    """Schema for updating a goal."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    target: Optional[Decimal] = Field(default=None, gt=0, decimal_places=4)
    target_amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=4)
    current: Optional[Decimal] = Field(default=None, ge=0, decimal_places=4)
    current_amount: Optional[Decimal] = Field(default=None, ge=0, decimal_places=4)
    color: Optional[str] = Field(default=None, max_length=50)
    category: Optional[str] = Field(default=None, max_length=100)
    target_date: Optional[datetime] = Field(default=None, alias="targetDate")
    status: Optional[Literal["in_progress", "completed", "archived"]] = None

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class GoalRead(BaseModel):
    """Schema for reading goal details matching frontend contract."""
    id: str
    user_id: str
    name: str
    target: Decimal
    current: Decimal
    color: str
    category: Optional[str] = None
    target_date: Optional[datetime] = Field(default=None, alias="targetDate")
    status: str
    progress: float = 0.0
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)
