"""Notifications API router with unread management and user isolation."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.notification import NotificationRead
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=ApiResponse[List[NotificationRead]], summary="List user notifications")
async def list_notifications(
    unread_only: bool = Query(False, alias="unreadOnly", description="Filter only unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Max notifications to retrieve"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve in-app notifications for authenticated user in newest-first order."""
    service = NotificationService(db)
    result = await service.list_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit,
    )
    return ApiResponse.ok(data=result, message="Notifications retrieved successfully.")


@router.patch("/{notification_id}/read", response_model=ApiResponse[NotificationRead], summary="Mark notification read")
@router.post("/{notification_id}/read", response_model=ApiResponse[NotificationRead], summary="Mark notification read (POST alias)")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a specific notification as read."""
    service = NotificationService(db)
    result = await service.mark_as_read(
        notification_id=notification_id,
        user_id=current_user.id,
    )
    return ApiResponse.ok(data=result, message="Notification marked as read.")


@router.post("/read-all", response_model=ApiResponse[Dict[str, Any]], summary="Mark all notifications read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications as read for authenticated user."""
    service = NotificationService(db)
    count = await service.mark_all_as_read(user_id=current_user.id)
    return ApiResponse.ok(
        data={"updated_count": count, "success": True},
        message=f"Marked {count} notifications as read.",
    )


@router.post("/clear-all", response_model=ApiResponse[Dict[str, Any]], summary="Clear all notifications")
async def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete all notifications for authenticated user."""
    service = NotificationService(db)
    count = await service.clear_all(user_id=current_user.id)
    return ApiResponse.ok(
        data={"deleted_count": count, "success": True},
        message=f"Cleared {count} notifications.",
    )


@router.delete("/{notification_id}", response_model=ApiResponse[Dict[str, Any]], summary="Delete notification")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a specific user-owned notification."""
    service = NotificationService(db)
    deleted_id = await service.delete_notification(
        notification_id=notification_id,
        user_id=current_user.id,
    )
    return ApiResponse.ok(
        data={"id": deleted_id, "deleted": True},
        message="Notification deleted successfully.",
    )
