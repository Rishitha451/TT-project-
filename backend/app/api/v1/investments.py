"""Investment domain API router: Portfolios, Holdings, Summary, Market, Risk, Insights."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.investment import (
    AssetDetail,
    InvestmentPortfolioCreate,
    InvestmentPortfolioRead,
    InvestmentPortfolioUpdate,
    InvestmentPositionCreate,
    InvestmentPositionRead,
    InvestmentPositionUpdate,
    InvestmentInsight,
    MarketIndex,
    MarketNewsItem,
    MarketOverviewResponse,
    MarketSentiment,
    PortfolioSummaryRead,
    RiskMetrics,
)
from app.services.investment_insight_service import InvestmentInsightService
from app.services.investment_summary_service import InvestmentSummaryService
from app.services.market_service import MarketService
from app.services.portfolio_service import PortfolioService
from app.services.position_service import PositionService
from app.services.risk_service import RiskService

router = APIRouter(prefix="/investments", tags=["Investments"])


# ---------------------------------------------------------------------------
# 1. Portfolios
# ---------------------------------------------------------------------------

@router.get("/portfolios", response_model=ApiResponse[List[InvestmentPortfolioRead]], summary="List user portfolios")
async def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all investment portfolios owned by authenticated user."""
    service = PortfolioService(db)
    result = await service.list_portfolios(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Portfolios retrieved successfully.")


@router.get("/portfolios/{portfolio_id}", response_model=ApiResponse[InvestmentPortfolioRead], summary="Get portfolio by ID")
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve single portfolio details ensuring user ownership."""
    service = PortfolioService(db)
    result = await service.get_portfolio(portfolio_id=portfolio_id, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Portfolio retrieved successfully.")


@router.post("/portfolios", response_model=ApiResponse[InvestmentPortfolioRead], summary="Create portfolio")
async def create_portfolio(
    payload: InvestmentPortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new investment portfolio account."""
    service = PortfolioService(db)
    result = await service.create_portfolio(payload=payload, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Portfolio created successfully.")


@router.patch("/portfolios/{portfolio_id}", response_model=ApiResponse[InvestmentPortfolioRead], summary="Update portfolio")
async def update_portfolio(
    portfolio_id: str,
    payload: InvestmentPortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user-owned investment portfolio."""
    service = PortfolioService(db)
    result = await service.update_portfolio(
        portfolio_id=portfolio_id,
        payload=payload,
        user_id=current_user.id,
    )
    return ApiResponse.ok(data=result, message="Portfolio updated successfully.")


@router.delete("/portfolios/{portfolio_id}", response_model=ApiResponse[Dict[str, Any]], summary="Delete portfolio")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an investment portfolio and its child positions."""
    service = PortfolioService(db)
    deleted_id = await service.delete_portfolio(portfolio_id=portfolio_id, user_id=current_user.id)
    return ApiResponse.ok(
        data={"id": deleted_id, "deleted": True},
        message="Portfolio deleted successfully.",
    )


# ---------------------------------------------------------------------------
# 2. Positions / Holdings
# ---------------------------------------------------------------------------

@router.get("/portfolios/{portfolio_id}/positions", response_model=ApiResponse[List[InvestmentPositionRead]], summary="List portfolio positions")
async def list_portfolio_positions(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all holding positions for a specific portfolio."""
    service = PositionService(db)
    result = await service.list_positions_by_portfolio(portfolio_id=portfolio_id, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Positions retrieved successfully.")


@router.post("/portfolios/{portfolio_id}/positions", response_model=ApiResponse[InvestmentPositionRead], summary="Create position in portfolio")
async def create_position(
    portfolio_id: str,
    payload: InvestmentPositionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a new stock / ETF holding to a user portfolio."""
    service = PositionService(db)
    result = await service.create_position(
        portfolio_id=portfolio_id,
        payload=payload,
        user_id=current_user.id,
    )
    return ApiResponse.ok(data=result, message="Position created successfully.")


@router.get("/positions", response_model=ApiResponse[List[InvestmentPositionRead]], summary="List all user positions")
async def list_all_positions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all investment holdings across all portfolios owned by authenticated user."""
    service = PositionService(db)
    result = await service.list_all_positions(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="All positions retrieved successfully.")


@router.get("/positions/{position_id}", response_model=ApiResponse[InvestmentPositionRead], summary="Get position by ID")
async def get_position(
    position_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single position ensuring ownership of parent portfolio."""
    service = PositionService(db)
    result = await service.get_position(position_id=position_id, user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Position retrieved successfully.")


@router.patch("/positions/{position_id}", response_model=ApiResponse[InvestmentPositionRead], summary="Update position")
async def update_position(
    position_id: str,
    payload: InvestmentPositionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update position shares, price, or details."""
    service = PositionService(db)
    result = await service.update_position(
        position_id=position_id,
        payload=payload,
        user_id=current_user.id,
    )
    return ApiResponse.ok(data=result, message="Position updated successfully.")


@router.delete("/positions/{position_id}", response_model=ApiResponse[Dict[str, Any]], summary="Delete position")
async def delete_position(
    position_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single investment position."""
    service = PositionService(db)
    deleted_id = await service.delete_position(position_id=position_id, user_id=current_user.id)
    return ApiResponse.ok(
        data={"id": deleted_id, "deleted": True},
        message="Position deleted successfully.",
    )


# ---------------------------------------------------------------------------
# 3. Portfolio Summary
# ---------------------------------------------------------------------------

@router.get("/summary", response_model=ApiResponse[PortfolioSummaryRead], summary="Get portfolio summary")
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Derive user aggregate investment value, cost basis, and PnL performance."""
    service = InvestmentSummaryService(db)
    result = await service.get_portfolio_summary(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Portfolio summary retrieved successfully.")


# ---------------------------------------------------------------------------
# 4. Market Intelligence
# ---------------------------------------------------------------------------

@router.get("/market", response_model=ApiResponse[MarketOverviewResponse], summary="Get market overview")
async def get_market(
    current_user: User = Depends(get_current_user),
):
    """Fetch consolidated market intelligence overview (indices, news, sentiment)."""
    service = MarketService()
    result = await service.get_market_overview()
    return ApiResponse.ok(data=result, message="Market overview retrieved successfully.")


@router.get("/indices", response_model=ApiResponse[List[MarketIndex]], summary="Get market benchmark indices")
async def get_indices(
    current_user: User = Depends(get_current_user),
):
    """Fetch major benchmark indices (S&P 500, NASDAQ, DOW, US 10Y, GOLD)."""
    service = MarketService()
    result = await service.get_market_indices()
    return ApiResponse.ok(data=result, message="Market indices retrieved successfully.")


@router.get("/news", response_model=ApiResponse[List[MarketNewsItem]], summary="Get market news")
async def get_news(
    current_user: User = Depends(get_current_user),
):
    """Fetch structured market news feed."""
    service = MarketService()
    result = await service.get_market_news()
    return ApiResponse.ok(data=result, message="Market news retrieved successfully.")


@router.get("/sentiment", response_model=ApiResponse[MarketSentiment], summary="Get market sentiment")
async def get_sentiment(
    current_user: User = Depends(get_current_user),
):
    """Fetch aggregate market sentiment indicator and historical trend."""
    service = MarketService()
    result = await service.get_market_sentiment()
    return ApiResponse.ok(data=result, message="Market sentiment retrieved successfully.")


@router.get("/assets/{ticker}", response_model=ApiResponse[AssetDetail], summary="Get asset detail profile")
async def get_asset_detail(
    ticker: str,
    current_user: User = Depends(get_current_user),
):
    """Fetch fundamental and technical profile for a stock or ETF."""
    service = MarketService()
    result = await service.get_asset_detail(ticker)
    return ApiResponse.ok(data=result, message="Asset profile retrieved successfully.")


# ---------------------------------------------------------------------------
# 5. Risk Analysis
# ---------------------------------------------------------------------------

@router.get("/risk", response_model=ApiResponse[RiskMetrics], summary="Get portfolio risk analytics")
async def get_risk(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Compute portfolio risk score, sector concentration, and scenario impacts."""
    service = RiskService(db)
    result = await service.get_risk_metrics(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Risk metrics retrieved successfully.")


# ---------------------------------------------------------------------------
# 6. Investment Insights
# ---------------------------------------------------------------------------

@router.get("/insights", response_model=ApiResponse[List[InvestmentInsight]], summary="Get investment insights")
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate deterministic, rule-based portfolio insights and risk considerations."""
    service = InvestmentInsightService(db)
    result = await service.get_investment_insights(user_id=current_user.id)
    return ApiResponse.ok(data=result, message="Investment insights retrieved successfully.")
