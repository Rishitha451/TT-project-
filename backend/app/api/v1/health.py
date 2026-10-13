from fastapi import APIRouter, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ...schemas.health import HealthStatus, ReadinessStatus
from ...core.config import settings
from ...dependencies.database import get_db
from ... import __version__

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=HealthStatus,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Returns service availability, environment, and version.",
)
async def get_health() -> HealthStatus:
    return HealthStatus(
        status="ok",
        service=settings.APP_NAME,
        environment=settings.APP_ENV,
        version=__version__,
    )

@router.get(
    "/ready",
    response_model=ReadinessStatus,
    status_code=status.HTTP_200_OK,
    summary="Readiness check endpoint",
    description="Returns service readiness and database connectivity.",
)
async def get_readiness(db: AsyncSession = Depends(get_db)) -> ReadinessStatus:
    db_status = "ok"
    import logging
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logging.error(f"Readiness DB error: {e}")
        db_status = "unavailable"
    
    return ReadinessStatus(
        status="ok" if db_status == "ok" else "unavailable",
        service=settings.APP_NAME,
        environment=settings.APP_ENV,
        version=__version__,
        database=db_status,
    )
