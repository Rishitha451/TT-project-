"""Investment domain Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# 1. Position / Holding Schemas
# ---------------------------------------------------------------------------

class InvestmentPositionBase(BaseModel):
    """Base investment holding properties."""
    ticker: str = Field(..., min_length=1, max_length=20, description="Stock / ETF ticker symbol")
    name: str = Field(..., min_length=1, max_length=255, description="Asset display name")
    shares: Decimal = Field(..., gt=0, decimal_places=6, description="Quantity / shares owned")
    avg_price: Decimal = Field(..., ge=0, decimal_places=4, alias="avgPrice", description="Average purchase price")
    current_price: Decimal = Field(..., ge=0, decimal_places=4, alias="currentPrice", description="Current market price")
    sector: Optional[str] = Field(default=None, max_length=100, description="Industry sector")
    asset_class: Literal["Equity", "ETF", "Fixed Income", "Commodity"] = Field(
        default="Equity",
        alias="assetClass",
        description="Asset classification category",
    )

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class InvestmentPositionCreate(InvestmentPositionBase):
    """Schema for adding a holding to a portfolio."""
    pass


class InvestmentPositionUpdate(BaseModel):
    """Schema for updating a holding."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    shares: Optional[Decimal] = Field(default=None, gt=0, decimal_places=6)
    avg_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=4, alias="avgPrice")
    current_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=4, alias="currentPrice")
    sector: Optional[str] = None
    asset_class: Optional[Literal["Equity", "ETF", "Fixed Income", "Commodity"]] = Field(
        default=None,
        alias="assetClass",
    )

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class InvestmentPositionRead(InvestmentPositionBase):
    """Schema for reading position with dynamically computed financial metrics."""
    id: str
    portfolio_id: str = Field(alias="portfolioId")
    total_value: Decimal = Field(alias="totalValue")
    pnl: Decimal = Field(alias="pnl")
    pnl_pct: Decimal = Field(alias="pnlPct")
    allocation: float = Field(default=0.0, description="Percentage of total portfolio value")
    day_change: Optional[Decimal] = Field(default=Decimal("0.0000"), alias="dayChange")
    day_change_pct: Optional[Decimal] = Field(default=Decimal("0.0000"), alias="dayChangePct")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)


# ---------------------------------------------------------------------------
# 2. Portfolio Schemas
# ---------------------------------------------------------------------------

class InvestmentPortfolioBase(BaseModel):
    """Base investment portfolio properties."""
    name: str = Field(default="Main Portfolio", min_length=1, max_length=255)
    account_type: Literal["taxable", "retirement", "trading"] = Field(
        default="taxable",
        alias="accountType",
    )
    brokerage_name: Optional[str] = Field(default=None, max_length=100, alias="brokerageName")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class InvestmentPortfolioCreate(InvestmentPortfolioBase):
    """Schema for creating a portfolio."""
    pass


class InvestmentPortfolioUpdate(BaseModel):
    """Schema for updating a portfolio."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    account_type: Optional[Literal["taxable", "retirement", "trading"]] = Field(default=None, alias="accountType")
    brokerage_name: Optional[str] = Field(default=None, max_length=100, alias="brokerageName")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class InvestmentPortfolioRead(InvestmentPortfolioBase):
    """Schema for reading a portfolio and its holdings."""
    id: str
    user_id: str = Field(alias="userId")
    total_value: Decimal = Field(default=Decimal("0.0000"), alias="totalValue")
    total_invested: Decimal = Field(default=Decimal("0.0000"), alias="totalInvested")
    positions: List[InvestmentPositionRead] = []
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)


# ---------------------------------------------------------------------------
# 3. Portfolio Summary Schemas
# ---------------------------------------------------------------------------

class PortfolioSummaryRead(BaseModel):
    """Aggregated portfolio performance metrics matching frontend PortfolioSummary."""
    total_value: Decimal = Field(alias="totalValue")
    total_invested: Decimal = Field(alias="totalInvested")
    todays_pnl: Decimal = Field(default=Decimal("0.0000"), alias="todaysPnl")
    todays_pnl_pct: Decimal = Field(default=Decimal("0.0000"), alias="todaysPnlPct")
    overall_pnl: Decimal = Field(alias="overallPnl")
    overall_pnl_pct: Decimal = Field(alias="overallPnlPct")
    risk_level: Literal["Conservative", "Moderate", "Aggressive", "Low", "High"] = Field(
        default="Moderate",
        alias="riskLevel",
    )
    market_sentiment: Literal["Bearish", "Neutral", "Bullish"] = Field(
        default="Neutral",
        alias="marketSentiment",
    )

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


# ---------------------------------------------------------------------------
# 4. Market Intelligence Schemas
# ---------------------------------------------------------------------------

class MarketIndex(BaseModel):
    """Market benchmark index data."""
    symbol: str
    name: str
    value: float
    change: float
    change_pct: float = Field(alias="changePct")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class MarketNewsItem(BaseModel):
    """Market news article item."""
    id: str
    headline: str
    source: str
    time: str
    sentiment: Literal["positive", "negative", "neutral"]
    ticker: Optional[str] = None
    change: Optional[float] = None
    category: Optional[Literal["Macro", "Equities", "Tech", "Commodities"]] = None

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class MarketSentiment(BaseModel):
    """Aggregate market sentiment."""
    score: float
    label: Literal["Bearish", "Neutral", "Bullish"]
    volatility_index: float = Field(alias="volatilityIndex")
    historical_scores: List[float] = Field(alias="historicalScores")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class HistoricalReturn(BaseModel):
    """Historical return record for an asset."""
    period: str
    return_pct: float = Field(alias="returnPct")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class AssetDetail(BaseModel):
    """Comprehensive asset fundamental and technical profile."""
    ticker: str
    name: str
    sector: str
    current_price: float = Field(alias="currentPrice")
    day_change: float = Field(alias="dayChange")
    day_change_pct: float = Field(alias="dayChangePct")
    high_52w: float = Field(alias="high52W")
    low_52w: float = Field(alias="low52W")
    market_cap: str = Field(alias="marketCap")
    pe_ratio: float = Field(alias="peRatio")
    dividend_yield: float = Field(alias="dividendYield")
    beta: float
    volume: str
    description: str
    historical_returns: List[HistoricalReturn] = Field(alias="historicalReturns")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class MarketOverviewResponse(BaseModel):
    """Unified market intelligence overview."""
    indices: List[MarketIndex]
    news: List[MarketNewsItem]
    sentiment: MarketSentiment

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


# ---------------------------------------------------------------------------
# 5. Risk Analysis Schemas
# ---------------------------------------------------------------------------

class RiskScenario(BaseModel):
    """Stress test simulation scenario."""
    id: str
    name: str
    description: str
    estimated_impact_pct: float = Field(alias="estimatedImpactPct")
    severity: Literal["low", "medium", "high"]
    likelihood: Literal["Low", "Moderate", "High"]

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class RiskExposure(BaseModel):
    """Sector / asset class risk exposure percentage."""
    sector: str
    percentage: float

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class RiskMetrics(BaseModel):
    """Portfolio risk analytics."""
    volatility: float
    beta: float
    sharpe_ratio: float = Field(alias="sharpeRatio")
    risk_score: int = Field(alias="riskScore")
    risk_level: Literal["Low", "Moderate", "High", "Conservative", "Aggressive"] = Field(alias="riskLevel")
    exposure: List[RiskExposure]
    scenarios: List[RiskScenario] = []

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


# ---------------------------------------------------------------------------
# 6. Investment Insights Schemas
# ---------------------------------------------------------------------------

class InvestmentInsightFactor(BaseModel):
    """Individual analytical factor contributing to signal."""
    name: str
    signal: Literal["Positive", "Neutral", "Negative", "Moderate", "High", "Low"]
    contribution: int


class InvestmentInsightAnalysis(BaseModel):
    """Signal analysis container."""
    overall_signal: Literal["Positive", "Neutral", "Negative"] = Field(alias="overallSignal")
    confidence: int
    factors: List[InvestmentInsightFactor]

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class InvestmentInsight(BaseModel):
    """Deterministic rule-based asset insight."""
    id: str
    ticker: str
    name: str
    analysis: InvestmentInsightAnalysis
    reasoning: List[str]
    considerations: List[str]
    timestamp: str
    action_recommendation: Optional[Literal["BUY", "HOLD", "REBALANCE", "TRIM"]] = Field(
        default="HOLD",
        alias="actionRecommendation",
    )

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
