"""Analytics API router computing cash flows and category trends."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary
from app.schemas.common import ApiResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=ApiResponse[AnalyticsSummary], summary="Get analytics summary")
async def get_analytics(
    timeframe: str = Query("6m", description="Timeframe filter (1m, 3m, 6m, 1y, all)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Compute financial cashflows, category distributions, and monthly trends."""
    service = AnalyticsService(db)
    result = await service.get_analytics_summary(user_id=current_user.id, timeframe=timeframe)
    return ApiResponse.ok(data=result, message="Analytics summary retrieved successfully.")
