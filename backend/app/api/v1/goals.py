"""Goals API router with user-scoped persistence and progress metrics."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=ApiResponse[List[GoalRead]], summary="List user goals")
async def list_goals(
    status: Optional[str] = Query(None, description="Filter by goal status (in_progress/completed/archived)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all financial goals scoped to the authenticated user."""
    service = GoalService(db)
    result = await service.list_goals(user_id=current_user.id, status=status)
    return ApiResponse.ok(data=result, message="Goals retrieved successfully.")


@router.get("/{goal_id}", response_model=ApiResponse[GoalRead], summary="Get goal by ID")
async def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single goal ensuring user ownership."""
    service = GoalService(db)
    result = await service.get_goal(goal_id=goal_id, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Goal retrieved successfully.")


@router.post("", response_model=ApiResponse[GoalRead], summary="Create goal")
async def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new financial goal owned by the authenticated user."""
    service = GoalService(db)
    result = await service.create_goal(payload=payload, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Goal created successfully.")


@router.patch("/{goal_id}", response_model=ApiResponse[GoalRead], summary="Update goal")
async def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user-owned financial goal."""
    service = GoalService(db)
    result = await service.update_goal(
        goal_id=goal_id,
        payload=payload,
        user_id=current_user.id,
    )
    return ApiResponse.ok(data=result, message="Goal updated successfully.")


@router.delete("/{goal_id}", response_model=ApiResponse[Dict[str, Any]], summary="Delete goal")
async def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user-owned financial goal."""
    service = GoalService(db)
    deleted_id = await service.delete_goal(
        goal_id=goal_id,
        user_id=current_user.id,
    )
    return ApiResponse.ok(
        data={"id": deleted_id, "deleted": True},
        message="Goal deleted successfully.",
    )
