from datetime import datetime, timezone
from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiErrorDetail(BaseModel):
    """Detailed error object matching frontend contracts."""
    code: str = Field(..., description="Standardized application error code")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context or validation details")


class ApiResponse(BaseModel, Generic[T]):
    """Standardized API response container matching frontend contracts."""
    success: bool = Field(default=True, description="Indicates operation success")
    data: Optional[T] = Field(default=None, description="Payload data")
    error: Optional[ApiErrorDetail] = Field(default=None, description="Error detail if success is False")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )

    @classmethod
    def ok(cls, data: Optional[T] = None, message: Optional[str] = None) -> "ApiResponse[T]":
        """Convenience factory method for successful API responses."""
        return cls(success=True, data=data)


class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized paginated list container."""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


class PlaceholderResponse(BaseModel):
    """Placeholder model for unimplemented domains."""
    domain: str
    status: str = "placeholder_foundation"
    message: str = "This domain endpoint is established and will be implemented in subsequent phases."
