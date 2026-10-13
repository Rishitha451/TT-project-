"""Transactions API router with user-scoped persistence and filtering."""

from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.transaction import (
    TransactionCreate,
    TransactionListResponse,
    TransactionRead,
    TransactionUpdate,
)
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=ApiResponse[TransactionListResponse], summary="List user transactions")
async def list_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page", alias="pageSize"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Alternative alias for page size"),
    category: Optional[str] = Query(None, description="Category filter"),
    type: Optional[str] = Query(None, description="Transaction type filter (credit/debit)"),
    status: Optional[str] = Query(None, description="Transaction status (completed/pending/cancelled)"),
    start_date: Optional[datetime] = Query(None, description="Start date filter (UTC)"),
    end_date: Optional[datetime] = Query(None, description="End date filter (UTC)"),
    sort_by: str = Query("date", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort direction (asc/desc)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch paginated, filtered transactions belonging strictly to the authenticated user."""
    effective_page_size = limit if limit is not None else page_size
    service = TransactionService(db)
    result = await service.list_transactions(
        user_id=current_user.id,
        page=page,
        page_size=effective_page_size,
        category=category,
        transaction_type=type,
        status=status,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ApiResponse.ok(data=result, message="Transactions retrieved successfully.")


@router.get("/{transaction_id}", response_model=ApiResponse[TransactionRead], summary="Get transaction by ID")
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single transaction scoped to the authenticated user."""
    service = TransactionService(db)
    result = await service.get_transaction(transaction_id=transaction_id, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Transaction retrieved successfully.")


@router.post("", response_model=ApiResponse[TransactionRead], summary="Create transaction")
async def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new transaction owned by the authenticated user."""
    service = TransactionService(db)
    result = await service.create_transaction(payload=payload, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Transaction created successfully.")


@router.patch("/{transaction_id}", response_model=ApiResponse[TransactionRead], summary="Update transaction")
async def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user-owned transaction."""
    service = TransactionService(db)
    result = await service.update_transaction(
        transaction_id=transaction_id,
        payload=payload,
        user_id=current_user.id,
    )
    return ApiResponse.ok(data=result, message="Transaction updated successfully.")


@router.delete("/{transaction_id}", response_model=ApiResponse[Dict[str, Any]], summary="Delete transaction")
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user-owned transaction."""
    service = TransactionService(db)
    deleted_id = await service.delete_transaction(
        transaction_id=transaction_id,
        user_id=current_user.id,
    )
    return ApiResponse.ok(
        data={"id": deleted_id, "deleted": True},
        message="Transaction deleted successfully.",
    )
