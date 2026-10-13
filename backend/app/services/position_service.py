"""Position business service layer for investment holdings."""

from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.investment import InvestmentPosition
from app.repositories.investment_repository import InvestmentRepository
from app.schemas.investment import (
    InvestmentPositionCreate,
    InvestmentPositionRead,
    InvestmentPositionUpdate,
)


class PositionService:
    """Service handling investment holdings CRUD and dynamic financial computations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = InvestmentRepository(db)

    def _to_read_schema(
        self,
        pos: InvestmentPosition,
        portfolio_total_value: Optional[Decimal] = None,
    ) -> InvestmentPositionRead:
        """Convert SQLAlchemy InvestmentPosition to InvestmentPositionRead with financial metrics."""
        total_val = pos.total_value
        total_inv = pos.total_invested
        pnl_val = pos.pnl
        pnl_pct_val = pos.pnl_pct

        allocation = 0.0
        if portfolio_total_value and portfolio_total_value > Decimal("0"):
            allocation = round(float((total_val / portfolio_total_value) * Decimal("100")), 2)

        return InvestmentPositionRead(
            id=pos.id,
            portfolio_id=pos.portfolio_id,
            ticker=pos.ticker,
            name=pos.name,
            shares=pos.shares,
            avg_price=pos.avg_price,
            current_price=pos.current_price,
            total_value=total_val,
            pnl=pnl_val,
            pnl_pct=pnl_pct_val,
            allocation=allocation,
            sector=pos.sector,
            asset_class=pos.asset_class,
            day_change=Decimal("0.0000"),
            day_change_pct=Decimal("0.0000"),
            created_at=pos.created_at,
            updated_at=pos.updated_at,
        )

    async def list_positions_by_portfolio(
        self,
        portfolio_id: str,
        user_id: str,
    ) -> List[InvestmentPositionRead]:
        """Fetch all positions for a specific portfolio with allocations."""
        portfolio = await self.repo.get_portfolio_by_id_for_user(portfolio_id, user_id)
        if not portfolio:
            raise NotFoundException(
                message=f"Investment portfolio with ID '{portfolio_id}' was not found.",
            )

        positions = portfolio.positions
        portfolio_total = sum((p.total_value for p in positions), Decimal("0.0000"))
        return [self._to_read_schema(p, portfolio_total) for p in positions]

    async def list_all_positions(self, user_id: str) -> List[InvestmentPositionRead]:
        """Fetch all positions across all portfolios owned by the user."""
        positions = await self.repo.get_all_positions_for_user(user_id)
        total_val = sum((p.total_value for p in positions), Decimal("0.0000"))
        return [self._to_read_schema(p, total_val) for p in positions]

    async def get_position(self, position_id: str, user_id: str) -> InvestmentPositionRead:
        """Fetch a single position ensuring user ownership of parent portfolio."""
        pos = await self.repo.get_position_by_id_for_user(position_id, user_id)
        if not pos:
            raise NotFoundException(
                message=f"Investment position with ID '{position_id}' was not found.",
            )
        return self._to_read_schema(pos)

    async def create_position(
        self,
        portfolio_id: str,
        payload: InvestmentPositionCreate,
        user_id: str,
    ) -> InvestmentPositionRead:
        """Add a holding to a portfolio owned by the user."""
        portfolio = await self.repo.get_portfolio_by_id_for_user(portfolio_id, user_id)
        if not portfolio:
            raise NotFoundException(
                message=f"Investment portfolio with ID '{portfolio_id}' was not found.",
            )

        position = InvestmentPosition(
            portfolio_id=portfolio.id,
            ticker=payload.ticker.strip().upper(),
            name=payload.name.strip(),
            shares=payload.shares,
            avg_price=payload.avg_price,
            current_price=payload.current_price,
            sector=payload.sector,
            asset_class=payload.asset_class,
        )
        created = await self.repo.create_position(position)
        await self.db.commit()
        await self.db.refresh(created)
        return self._to_read_schema(created)

    async def update_position(
        self,
        position_id: str,
        payload: InvestmentPositionUpdate,
        user_id: str,
    ) -> InvestmentPositionRead:
        """Update holding details ensuring user ownership."""
        pos = await self.repo.get_position_by_id_for_user(position_id, user_id)
        if not pos:
            raise NotFoundException(
                message=f"Investment position with ID '{position_id}' was not found.",
            )

        if payload.name is not None:
            pos.name = payload.name.strip()
        if payload.shares is not None:
            pos.shares = payload.shares
        if payload.avg_price is not None:
            pos.avg_price = payload.avg_price
        if payload.current_price is not None:
            pos.current_price = payload.current_price
        if payload.sector is not None:
            pos.sector = payload.sector
        if payload.asset_class is not None:
            pos.asset_class = payload.asset_class

        updated = await self.repo.update_position(pos)
        await self.db.commit()
        await self.db.refresh(updated)
        return self._to_read_schema(updated)

    async def delete_position(self, position_id: str, user_id: str) -> str:
        """Delete holding ensuring user ownership."""
        pos = await self.repo.get_position_by_id_for_user(position_id, user_id)
        if not pos:
            raise NotFoundException(
                message=f"Investment position with ID '{position_id}' was not found.",
            )

        await self.repo.delete_position(pos)
        await self.db.commit()
        return position_id
