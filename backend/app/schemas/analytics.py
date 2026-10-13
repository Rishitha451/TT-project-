"""Analytics and spending trend aggregation schemas."""

from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.dashboard import SpendingCategory


class AnalyticsTrendPoint(BaseModel):
    """Monthly cash flow trend data point."""
    month: str
    income: Decimal
    expenses: Decimal
    savings: Decimal


class TopExpenseCategory(BaseModel):
    """Top spending category item."""
    category: str
    amount: Decimal
    percentage: float


class AnalyticsSummary(BaseModel):
    """Complete analytics summary response matching frontend contract."""
    timeframe: str
    total_income: Decimal = Field(..., alias="totalIncome")
    total_expenses: Decimal = Field(..., alias="totalExpenses")
    net_savings: Decimal = Field(..., alias="netSavings")
    savings_rate: float = Field(..., alias="savingsRate")
    monthly_trends: List[AnalyticsTrendPoint] = Field(default=[], alias="monthlyTrends")
    category_breakdown: List[SpendingCategory] = Field(default=[], alias="categoryBreakdown")
    top_expenses: List[TopExpenseCategory] = Field(default=[], alias="topExpenses")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
