from pydantic import BaseModel, Field
from datetime import datetime, timezone


class HealthStatus(BaseModel):
    """Health check payload model."""
    status: str = Field(default="ok", description="Overall service status")
    service: str = Field(..., description="Service identifier")
    environment: str = Field(..., description="Deployment environment (development, production)")
    version: str = Field(..., description="Application version")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Current server UTC timestamp",
    )

class ReadinessStatus(HealthStatus):
    """Readiness check payload model."""
    database: str = Field(..., description="Database connectivity status (ok, unavailable)")
