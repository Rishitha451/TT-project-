"""Financial Profile entity model for manual onboarding baseline."""

from decimal import Decimal
from typing import TYPE_CHECKING, Any, Dict, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class FinancialProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Financial Profile entity storing user-entered baseline financial information.
    Persists income, expense distributions, savings, assets, liabilities, and risk tolerance.
    """

    __tablename__ = "financial_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False,
    )
    employment_status: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    # Monthly Cashflow Baseline
    monthly_income: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    additional_income: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    income_sources: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    monthly_expenses: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    expense_categories: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    savings: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )

    # Cash & Liquid Reserves
    cash_balance: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    emergency_fund: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )

    # Assets & Investments
    total_assets: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    asset_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    total_investments: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    investment_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    # Liabilities & Debts
    total_debt: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    debt_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )

    # Risk Profile
    risk_profile: Mapped[str] = mapped_column(
        String(50),
        default="Moderate",
        nullable=False,
    )
    risk_score: Mapped[int] = mapped_column(
        Integer,
        default=50,
        nullable=False,
    )

    # Status
    onboarding_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="financial_profile",
    )

    def __repr__(self) -> str:
        return f"<FinancialProfile(id={self.id}, user_id={self.user_id}, income={self.monthly_income}, onboarding_completed={self.onboarding_completed})>"
