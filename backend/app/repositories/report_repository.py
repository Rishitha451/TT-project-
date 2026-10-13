"""Financial report repository for persistence operations."""

from typing import Sequence
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import FinancialReport
from app.repositories.base import BaseRepository


class FinancialReportRepository(BaseRepository[FinancialReport]):
    """Repository handling FinancialReport persistence."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(FinancialReport, session)

    async def get_by_user(self, user_id: str) -> Sequence[FinancialReport]:
        """Fetch all reports for a user sorted newest first."""
        query = (
            select(FinancialReport)
            .where(FinancialReport.user_id == user_id)
            .order_by(desc(FinancialReport.created_at))
        )
        result = await self.session.execute(query)
        return result.scalars().all()
