"""Dashboard aggregated metrics schemas."""

from decimal import Decimal
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.transaction import TransactionRead


class FinancialSummary(BaseModel):
    """Financial balance and monthly flow summary."""
    net_worth: Decimal = Field(..., alias="netWorth")
    monthly_income: Decimal = Field(..., alias="monthlyIncome")
    monthly_expenses: Decimal = Field(..., alias="monthlyExpenses")
    savings: Decimal
    savings_rate: Optional[float] = Field(default=0.0, alias="savingsRate")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class SpendingCategory(BaseModel):
    """Category spending breakdown entry."""
    category: str
    amount: Decimal
    color: str = "#3B82F6"
    percentage: Optional[float] = 0.0

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class FinancialInsight(BaseModel):
    """Deterministic financial insight / recommendation."""
    id: str
    title: str
    description: str
    type: Literal["warning", "info", "success"]
    date: str
    action_url: Optional[str] = Field(default=None, alias="actionUrl")
    category: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class DashboardData(BaseModel):
    """Complete aggregated dashboard data matching frontend contract."""
    summary: FinancialSummary
    net_worth: Decimal = Field(..., alias="netWorth")
    monthly_income: Decimal = Field(..., alias="monthlyIncome")
    monthly_expenses: Decimal = Field(..., alias="monthlyExpenses")
    savings: Decimal
    spending: List[SpendingCategory] = []
    transactions: List[TransactionRead] = []
    insights: List[FinancialInsight] = []

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
