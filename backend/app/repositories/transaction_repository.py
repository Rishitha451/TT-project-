"""Transaction repository for user-scoped persistence and aggregation queries."""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Sequence, Tuple
from sqlalchemy import and_, asc, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """Repository handling user-scoped Transaction persistence."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Transaction, session)

    async def get_by_id_for_user(self, transaction_id: str, user_id: str) -> Optional[Transaction]:
        """Fetch transaction by ID ensuring strict user ownership."""
        query = select(Transaction).where(
            and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_user_paginated(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        transaction_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> Sequence[Transaction]:
        """Fetch filtered and paginated transactions for a user."""
        query = select(Transaction).where(Transaction.user_id == user_id)

        if category:
            query = query.where(Transaction.category == category)
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        if status:
            query = query.where(Transaction.status == status)
        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)

        # Sorting column
        sort_column = getattr(Transaction, sort_by, Transaction.date)
        order_func = desc if sort_order.lower() == "desc" else asc
        query = query.order_by(order_func(sort_column)).offset(skip).limit(limit)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_by_user(
        self,
        user_id: str,
        category: Optional[str] = None,
        transaction_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> int:
        """Count total matching transactions for pagination metadata."""
        query = select(func.count(Transaction.id)).where(Transaction.user_id == user_id)

        if category:
            query = query.where(Transaction.category == category)
        if transaction_type:
            query = query.where(Transaction.type == transaction_type)
        if status:
            query = query.where(Transaction.status == status)
        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def get_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Sequence[Transaction]:
        """Convenience method for fetching transactions with basic filters."""
        return await self.get_by_user_paginated(
            user_id=user_id,
            skip=skip,
            limit=limit,
            category=category,
            start_date=start_date,
            end_date=end_date,
        )

    async def get_cashflow_totals_by_user(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Decimal]:
        """Compute aggregated total income (credits) and total expenses (debits)."""
        query = (
            select(
                Transaction.type,
                func.coalesce(func.sum(Transaction.amount), Decimal("0.0000")),
            )
            .where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.status == "completed",
                )
            )
            .group_by(Transaction.type)
        )

        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)

        result = await self.session.execute(query)
        rows = result.all()
        totals = {"credit": Decimal("0.0000"), "debit": Decimal("0.0000")}
        for tx_type, total in rows:
            totals[tx_type] = Decimal(str(total))
        return totals

    async def get_category_spending_by_user(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Tuple[str, Decimal]]:
        """Compute total debit spending grouped by category."""
        query = (
            select(
                Transaction.category,
                func.coalesce(func.sum(Transaction.amount), Decimal("0.0000")),
            )
            .where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.type == "debit",
                    Transaction.status == "completed",
                )
            )
            .group_by(Transaction.category)
            .order_by(desc(func.sum(Transaction.amount)))
        )

        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)

        result = await self.session.execute(query)
        return [(cat, Decimal(str(total))) for cat, total in result.all()]
