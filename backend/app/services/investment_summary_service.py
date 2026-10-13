"""Portfolio summary aggregation service."""

from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession

from app.providers.market_provider import default_market_provider
from app.repositories.investment_repository import InvestmentRepository
from app.schemas.investment import PortfolioSummaryRead


class InvestmentSummaryService:
    """Service deriving total investment snapshot and performance metrics."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = InvestmentRepository(db)
        self.market_provider = default_market_provider

    async def get_portfolio_summary(self, user_id: str) -> PortfolioSummaryRead:
        """Calculate overall investment summary across all user holdings."""
        positions = await self.repo.get_all_positions_for_user(user_id)

        total_val = sum((p.total_value for p in positions), Decimal("0.0000"))
        total_inv = sum((p.total_invested for p in positions), Decimal("0.0000"))
        overall_pnl = total_val - total_inv

        overall_pnl_pct = Decimal("0.0000")
        if total_inv > Decimal("0"):
            overall_pnl_pct = round((overall_pnl / total_inv) * Decimal("100"), 2)

        # Derive portfolio risk level deterministically
        fixed_income_val = sum(
            (p.total_value for p in positions if p.asset_class == "Fixed Income"),
            Decimal("0.0000"),
        )
        equity_val = sum(
            (p.total_value for p in positions if p.asset_class in ("Equity", "Commodity")),
            Decimal("0.0000"),
        )

        if total_val == Decimal("0"):
            risk_level = "Moderate"
        elif fixed_income_val / total_val > Decimal("0.5"):
            risk_level = "Conservative"
        elif equity_val / total_val > Decimal("0.8"):
            risk_level = "Aggressive"
        else:
            risk_level = "Moderate"

        sentiment_obj = await self.market_provider.get_market_sentiment()
        market_sentiment = sentiment_obj.label

        return PortfolioSummaryRead(
            total_value=total_val,
            total_invested=total_inv,
            todays_pnl=Decimal("0.0000"),
            todays_pnl_pct=Decimal("0.0000"),
            overall_pnl=overall_pnl,
            overall_pnl_pct=overall_pnl_pct,
            risk_level=risk_level,
            market_sentiment=market_sentiment,
        )
