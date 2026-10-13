"""Transaction Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class TransactionBase(BaseModel):
    """Base transaction properties."""
    title: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0, decimal_places=4)
    type: Literal["credit", "debit"]
    date: Optional[datetime] = None
    status: Literal["completed", "pending", "failed"] = "completed"
    account_name: Optional[str] = Field(default=None, max_length=100, alias="accountName")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=4)
    type: Optional[Literal["credit", "debit"]] = None
    date: Optional[datetime] = None
    status: Optional[Literal["completed", "pending", "failed"]] = None
    account_name: Optional[str] = Field(default=None, max_length=100, alias="accountName")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class TransactionRead(TransactionBase):
    """Schema for returning transaction details."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)

    id: str
    user_id: str
    date: datetime
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    """Paginated transactions list response."""
    items: List[TransactionRead]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")
    total_pages: int = Field(alias="totalPages")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
