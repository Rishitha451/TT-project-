"""Financial report Pydantic schemas."""

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class FinancialReportBase(BaseModel):
    """Base financial report properties."""
    name: str = Field(..., min_length=1, max_length=255)
    period: str = Field(..., min_length=1, max_length=50)
    report_type: Literal["summary", "tax", "spending", "portfolio"] = "summary"
    status: Literal["Ready", "Processing", "Failed"] = "Ready"
    file_size: Optional[str] = Field(default=None, max_length=50)
    download_url: Optional[str] = Field(default=None, max_length=512)


class FinancialReportCreate(FinancialReportBase):
    """Schema for requesting or registering a financial report."""
    pass


class FinancialReportRead(FinancialReportBase):
    """Schema for reading report details."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
