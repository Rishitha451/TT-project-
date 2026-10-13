"""Investment repository with strict user ownership isolation."""

from typing import List, Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.investment import InvestmentPortfolio, InvestmentPosition
from app.repositories.base import BaseRepository


class InvestmentRepository:
    """Repository handling investment portfolios and positions persistence with user isolation."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.portfolio_repo = BaseRepository[InvestmentPortfolio](InvestmentPortfolio, session)
        self.position_repo = BaseRepository[InvestmentPosition](InvestmentPosition, session)

    async def get_portfolios_by_user(self, user_id: str) -> Sequence[InvestmentPortfolio]:
        """Fetch all portfolios for a user with positions loaded."""
        query = (
            select(InvestmentPortfolio)
            .where(InvestmentPortfolio.user_id == user_id)
            .options(selectinload(InvestmentPortfolio.positions))
            .order_by(InvestmentPortfolio.created_at.asc())
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_portfolio_by_id_for_user(
        self,
        portfolio_id: str,
        user_id: str,
    ) -> Optional[InvestmentPortfolio]:
        """Fetch single portfolio ensuring user ownership."""
        query = (
            select(InvestmentPortfolio)
            .where(
                InvestmentPortfolio.id == portfolio_id,
                InvestmentPortfolio.user_id == user_id,
            )
            .options(selectinload(InvestmentPortfolio.positions))
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create_portfolio(self, portfolio: InvestmentPortfolio) -> InvestmentPortfolio:
        """Create and persist a new portfolio."""
        return await self.portfolio_repo.create(portfolio)

    async def update_portfolio(self, portfolio: InvestmentPortfolio) -> InvestmentPortfolio:
        """Update an existing portfolio."""
        return await self.portfolio_repo.update(portfolio)

    async def delete_portfolio(self, portfolio: InvestmentPortfolio) -> None:
        """Delete a portfolio (cascade removes child positions)."""
        await self.portfolio_repo.delete(portfolio)

    async def get_positions_by_portfolio_for_user(
        self,
        portfolio_id: str,
        user_id: str,
    ) -> Sequence[InvestmentPosition]:
        """Fetch all positions for a specific portfolio ensuring user ownership."""
        portfolio = await self.get_portfolio_by_id_for_user(portfolio_id, user_id)
        if not portfolio:
            return []
        return portfolio.positions

    async def get_all_positions_for_user(self, user_id: str) -> List[InvestmentPosition]:
        """Fetch all positions across all portfolios owned by the user."""
        query = (
            select(InvestmentPosition)
            .join(InvestmentPortfolio, InvestmentPosition.portfolio_id == InvestmentPortfolio.id)
            .where(InvestmentPortfolio.user_id == user_id)
            .order_by(InvestmentPosition.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_position_by_id_for_user(
        self,
        position_id: str,
        user_id: str,
    ) -> Optional[InvestmentPosition]:
        """Fetch a position ensuring its parent portfolio belongs to the user."""
        query = (
            select(InvestmentPosition)
            .join(InvestmentPortfolio, InvestmentPosition.portfolio_id == InvestmentPortfolio.id)
            .where(
                InvestmentPosition.id == position_id,
                InvestmentPortfolio.user_id == user_id,
            )
            .options(selectinload(InvestmentPosition.portfolio))
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create_position(self, position: InvestmentPosition) -> InvestmentPosition:
        """Create and persist a new holding position."""
        return await self.position_repo.create(position)

    async def update_position(self, position: InvestmentPosition) -> InvestmentPosition:
        """Update an existing position."""
        return await self.position_repo.update(position)

    async def delete_position(self, position: InvestmentPosition) -> None:
        """Delete a single position."""
        await self.position_repo.delete(position)
