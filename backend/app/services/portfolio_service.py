"""Portfolio business service layer."""

from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.investment import InvestmentPortfolio
from app.repositories.investment_repository import InvestmentRepository
from app.schemas.investment import (
    InvestmentPortfolioCreate,
    InvestmentPortfolioRead,
    InvestmentPortfolioUpdate,
    InvestmentPositionRead,
)


class PortfolioService:
    """Service handling investment portfolio accounts and aggregations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = InvestmentRepository(db)

    def _to_read_schema(self, portfolio: InvestmentPortfolio) -> InvestmentPortfolioRead:
        """Convert SQLAlchemy InvestmentPortfolio to InvestmentPortfolioRead schema."""
        positions = portfolio.positions or []
        total_val = sum((p.total_value for p in positions), Decimal("0.0000"))
        total_inv = sum((p.total_invested for p in positions), Decimal("0.0000"))

        position_reads: List[InvestmentPositionRead] = []
        for p in positions:
            alloc = 0.0
            if total_val > Decimal("0"):
                alloc = round(float((p.total_value / total_val) * Decimal("100")), 2)

            position_reads.append(
                InvestmentPositionRead(
                    id=p.id,
                    portfolio_id=p.portfolio_id,
                    ticker=p.ticker,
                    name=p.name,
                    shares=p.shares,
                    avg_price=p.avg_price,
                    current_price=p.current_price,
                    total_value=p.total_value,
                    pnl=p.pnl,
                    pnl_pct=p.pnl_pct,
                    allocation=alloc,
                    sector=p.sector,
                    asset_class=p.asset_class,
                    day_change=Decimal("0.0000"),
                    day_change_pct=Decimal("0.0000"),
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
            )

        return InvestmentPortfolioRead(
            id=portfolio.id,
            user_id=portfolio.user_id,
            name=portfolio.name,
            account_type=portfolio.account_type,
            brokerage_name=portfolio.brokerage_name,
            total_value=total_val,
            total_invested=total_inv,
            positions=position_reads,
            created_at=portfolio.created_at,
            updated_at=portfolio.updated_at,
        )

    async def list_portfolios(self, user_id: str) -> List[InvestmentPortfolioRead]:
        """Fetch all portfolios for authenticated user."""
        portfolios = await self.repo.get_portfolios_by_user(user_id)
        return [self._to_read_schema(p) for p in portfolios]

    async def get_portfolio(self, portfolio_id: str, user_id: str) -> InvestmentPortfolioRead:
        """Fetch single portfolio ensuring user ownership."""
        portfolio = await self.repo.get_portfolio_by_id_for_user(portfolio_id, user_id)
        if not portfolio:
            raise NotFoundException(
                message=f"Investment portfolio with ID '{portfolio_id}' was not found.",
            )
        return self._to_read_schema(portfolio)

    async def create_portfolio(
        self,
        payload: InvestmentPortfolioCreate,
        user_id: str,
    ) -> InvestmentPortfolioRead:
        """Create and persist a new portfolio."""
        portfolio = InvestmentPortfolio(
            user_id=user_id,
            name=payload.name.strip(),
            account_type=payload.account_type,
            brokerage_name=payload.brokerage_name,
        )
        created = await self.repo.create_portfolio(portfolio)
        await self.db.commit()
        await self.db.refresh(created)
        return self._to_read_schema(created)

    async def update_portfolio(
        self,
        portfolio_id: str,
        payload: InvestmentPortfolioUpdate,
        user_id: str,
    ) -> InvestmentPortfolioRead:
        """Update portfolio details ensuring user ownership."""
        portfolio = await self.repo.get_portfolio_by_id_for_user(portfolio_id, user_id)
        if not portfolio:
            raise NotFoundException(
                message=f"Investment portfolio with ID '{portfolio_id}' was not found.",
            )

        if payload.name is not None:
            portfolio.name = payload.name.strip()
        if payload.account_type is not None:
            portfolio.account_type = payload.account_type
        if payload.brokerage_name is not None:
            portfolio.brokerage_name = payload.brokerage_name

        updated = await self.repo.update_portfolio(portfolio)
        await self.db.commit()
        await self.db.refresh(updated)
        return self._to_read_schema(updated)

    async def delete_portfolio(self, portfolio_id: str, user_id: str) -> str:
        """Delete portfolio ensuring user ownership."""
        portfolio = await self.repo.get_portfolio_by_id_for_user(portfolio_id, user_id)
        if not portfolio:
            raise NotFoundException(
                message=f"Investment portfolio with ID '{portfolio_id}' was not found.",
            )

        await self.repo.delete_portfolio(portfolio)
        await self.db.commit()
        return portfolio_id

    async def get_or_create_default_portfolio(self, user_id: str) -> InvestmentPortfolio:
        """Ensure user has at least one portfolio and return it."""
        portfolios = await self.repo.get_portfolios_by_user(user_id)
        if portfolios:
            return portfolios[0]

        default_portfolio = InvestmentPortfolio(
            user_id=user_id,
            name="Main Portfolio",
            account_type="taxable",
            brokerage_name="Standard Brokerage",
        )
        created = await self.repo.create_portfolio(default_portfolio)
        await self.db.commit()
        await self.db.refresh(created)
        return created
