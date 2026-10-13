"""Dashboard API router computing canonical financial snapshot."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.dashboard import DashboardData
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=ApiResponse[DashboardData], summary="Get dashboard summary")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Derive real-time financial snapshot and aggregations for authenticated user."""
    service = DashboardService(db)
    result = await service.get_dashboard_data(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Dashboard data retrieved successfully.")
