"""Investment domain models: Portfolios and Positions."""

from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class InvestmentPortfolio(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Investment portfolio / account entity owned by a user.
    """

    __tablename__ = "investment_portfolios"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        default="Main Portfolio",
        nullable=False,
    )
    account_type: Mapped[str] = mapped_column(
        String(50),
        default="taxable",
        nullable=False,  # 'taxable' | 'retirement' | 'trading'
    )
    brokerage_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="portfolios",
    )
    positions: Mapped[List["InvestmentPosition"]] = relationship(
        "InvestmentPosition",
        back_populates="portfolio",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<InvestmentPortfolio(id={self.id}, name={self.name}, user_id={self.user_id})>"


class InvestmentPosition(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual investment holding / position within a portfolio.
    Uses exact Decimal numeric representations for fractional shares and currency prices.
    Derived fields (total_value, pnl, pnl_pct) are computed dynamically.
    """

    __tablename__ = "investment_positions"

    portfolio_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("investment_portfolios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticker: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    # Up to 6 decimal places for fractional shares (e.g. 10.123456)
    shares: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=6, asdecimal=True),
        nullable=False,
    )
    # Price precision: 4 decimal places
    avg_price: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        nullable=False,
    )
    current_price: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        nullable=False,
    )
    sector: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    asset_class: Mapped[str] = mapped_column(
        String(50),
        default="Equity",
        nullable=False,  # 'Equity' | 'ETF' | 'Fixed Income' | 'Commodity'
    )

    portfolio: Mapped["InvestmentPortfolio"] = relationship(
        "InvestmentPortfolio",
        back_populates="positions",
    )

    __table_args__ = (
        Index("ix_investment_positions_portfolio_ticker", "portfolio_id", "ticker"),
    )

    @property
    def total_value(self) -> Decimal:
        """Dynamically compute position current market value: shares * current_price."""
        return self.shares * self.current_price

    @property
    def total_invested(self) -> Decimal:
        """Dynamically compute position total cost basis: shares * avg_price."""
        return self.shares * self.avg_price

    @property
    def pnl(self) -> Decimal:
        """Dynamically compute unrealized profit/loss: total_value - total_invested."""
        return self.total_value - self.total_invested

    @property
    def pnl_pct(self) -> Decimal:
        """Dynamically compute unrealized profit/loss percentage rounded to 4 decimals."""
        invested = self.total_invested
        if invested == Decimal("0"):
            return Decimal("0.0000")
        return round((self.pnl / invested) * Decimal("100"), 4)

    def __repr__(self) -> str:
        return f"<InvestmentPosition(id={self.id}, ticker={self.ticker}, shares={self.shares}, avg={self.avg_price})>"
