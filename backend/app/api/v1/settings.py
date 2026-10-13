"""Settings and profile API router with user-scoped isolation."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.settings import (
    UserPreferencesRead,
    UserPreferencesUpdate,
    UserProfileRead,
    UserProfileUpdate,
    UserSettingsRead,
    UserSettingsUpdate,
)
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=ApiResponse[UserSettingsRead], summary="Get user settings")
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full settings (profile + preferences) for authenticated user."""
    service = SettingsService(db)
    result = await service.get_user_settings(user=current_user)
    return ApiResponse.ok(data=result, message="Settings retrieved successfully.")


@router.patch("", response_model=ApiResponse[UserSettingsRead], summary="Update user settings")
async def update_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update combined profile and preferences for authenticated user."""
    service = SettingsService(db)
    result = await service.update_settings(user=current_user, payload=payload)
    return ApiResponse.ok(data=result, message="Settings updated successfully.")


@router.post("/profile", response_model=ApiResponse[UserProfileRead], summary="Update user profile (POST)")
@router.patch("/profile", response_model=ApiResponse[UserProfileRead], summary="Update user profile (PATCH)")
async def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user personal profile details."""
    service = SettingsService(db)
    result = await service.update_profile(user=current_user, payload=payload)
    return ApiResponse.ok(data=result, message="Profile updated successfully.")


@router.post("/preferences", response_model=ApiResponse[UserPreferencesRead], summary="Update user preferences (POST)")
@router.patch("/preferences", response_model=ApiResponse[UserPreferencesRead], summary="Update user preferences (PATCH)")
async def update_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user UI, notification, and alert preferences."""
    service = SettingsService(db)
    result = await service.update_preferences(user=current_user, payload=payload)
    return ApiResponse.ok(data=result, message="Preferences updated successfully.")
