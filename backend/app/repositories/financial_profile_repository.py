"""Financial Profile repository for user-scoped baseline financial data."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_profile import FinancialProfile
from app.repositories.base import BaseRepository


class FinancialProfileRepository(BaseRepository[FinancialProfile]):
    """Repository handling user-scoped FinancialProfile persistence."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(FinancialProfile, session)

    async def get_by_user_id(self, user_id: str) -> Optional[FinancialProfile]:
        """Fetch unique financial profile for an authenticated user."""
        query = select(FinancialProfile).where(FinancialProfile.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
