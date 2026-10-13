"""Transaction business service layer."""

from datetime import datetime, timezone
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.transaction import Transaction
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import (
    TransactionCreate,
    TransactionListResponse,
    TransactionRead,
    TransactionUpdate,
)


class TransactionService:
    """Service handling Transaction business logic and authorization boundaries."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = TransactionRepository(db)

    async def list_transactions(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        transaction_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> TransactionListResponse:
        """Fetch paginated, filtered transactions scoped to the authenticated user."""
        page = max(1, page)
        page_size = min(max(1, page_size), 100)  # capped at 100
        skip = (page - 1) * page_size

        total = await self.repo.count_by_user(
            user_id=user_id,
            category=category,
            transaction_type=transaction_type,
            status=status,
            start_date=start_date,
            end_date=end_date,
        )

        items = await self.repo.get_by_user_paginated(
            user_id=user_id,
            skip=skip,
            limit=page_size,
            category=category,
            transaction_type=transaction_type,
            status=status,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        return TransactionListResponse(
            items=[TransactionRead.model_validate(t) for t in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_transaction(self, transaction_id: str, user_id: str) -> TransactionRead:
        """Fetch single transaction ensuring user ownership."""
        transaction = await self.repo.get_by_id_for_user(transaction_id, user_id)
        if not transaction:
            raise NotFoundException(
                message=f"Transaction with ID '{transaction_id}' was not found.",
            )
        return TransactionRead.model_validate(transaction)

    async def create_transaction(
        self,
        payload: TransactionCreate,
        user_id: str,
    ) -> TransactionRead:
        """Create and persist a user-owned transaction."""
        transaction = Transaction(
            user_id=user_id,
            title=payload.title.strip(),
            category=payload.category.strip(),
            amount=payload.amount,
            type=payload.type,
            date=payload.date or datetime.now(timezone.utc),
            status=payload.status,
            account_name=payload.account_name,
        )
        created = await self.repo.create(transaction)
        await self.db.commit()
        await self.db.refresh(created)
        return TransactionRead.model_validate(created)

    async def update_transaction(
        self,
        transaction_id: str,
        payload: TransactionUpdate,
        user_id: str,
    ) -> TransactionRead:
        """Update transaction fields ensuring user ownership."""
        transaction = await self.repo.get_by_id_for_user(transaction_id, user_id)
        if not transaction:
            raise NotFoundException(
                message=f"Transaction with ID '{transaction_id}' was not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(transaction, key, value)

        updated = await self.repo.update(transaction)
        await self.db.commit()
        await self.db.refresh(updated)
        return TransactionRead.model_validate(updated)

    async def delete_transaction(self, transaction_id: str, user_id: str) -> str:
        """Delete transaction ensuring user ownership."""
        transaction = await self.repo.get_by_id_for_user(transaction_id, user_id)
        if not transaction:
            raise NotFoundException(
                message=f"Transaction with ID '{transaction_id}' was not found.",
            )

        await self.repo.delete(transaction)
        await self.db.commit()
        return transaction_id
