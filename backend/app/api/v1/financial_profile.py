"""Financial Profile API router providing onboarding persistence and financial baseline management."""

from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.financial_profile import (
    FinancialProfileCreate,
    FinancialProfileRead,
    FinancialProfileStatus,
    FinancialProfileUpdate,
)
from app.services.financial_profile_service import FinancialProfileService

router = APIRouter(prefix="/financial-profile", tags=["Financial Profile"])


@router.get("", response_model=ApiResponse[Optional[FinancialProfileRead]], summary="Get financial profile")
async def get_financial_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve financial baseline profile for authenticated user."""
    service = FinancialProfileService(db)
    result = await service.get_profile(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Financial profile retrieved successfully.")


@router.get("/status", response_model=ApiResponse[FinancialProfileStatus], summary="Get onboarding status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check whether authenticated user has completed initial financial onboarding."""
    service = FinancialProfileService(db)
    result = await service.get_status(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Onboarding status retrieved successfully.")


@router.post("", response_model=ApiResponse[FinancialProfileRead], summary="Save onboarding financial profile")
async def save_financial_profile(
    payload: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or replace financial profile baseline during multi-step onboarding."""
    service = FinancialProfileService(db)
    result = await service.save_onboarding_profile(user=current_user, payload=payload)
    return ApiResponse.ok(data=result, message="Financial profile saved successfully.")


@router.patch("", response_model=ApiResponse[FinancialProfileRead], summary="Update financial profile")
async def update_financial_profile(
    payload: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Partially update financial baseline profile (e.g. from Settings)."""
    service = FinancialProfileService(db)
    result = await service.update_profile(user_id=current_user.id, payload=payload)
    return ApiResponse.ok(data=result, message="Financial profile updated successfully.")
