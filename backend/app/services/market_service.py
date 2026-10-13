"""Market intelligence service connecting to market data providers."""

from typing import List, Optional
from app.providers.market_provider import MarketDataProvider, default_market_provider
from app.schemas.investment import (
    AssetDetail,
    MarketIndex,
    MarketNewsItem,
    MarketOverviewResponse,
    MarketSentiment,
)


class MarketService:
    """Service providing benchmark market indices, financial news, sentiment, and asset profiles."""

    def __init__(self, provider: Optional[MarketDataProvider] = None) -> None:
        self.provider = provider or default_market_provider

    async def get_market_indices(self) -> List[MarketIndex]:
        """Fetch major benchmark market indices."""
        return await self.provider.get_market_indices()

    async def get_market_news(self) -> List[MarketNewsItem]:
        """Fetch market financial news feeds."""
        return await self.provider.get_market_news()

    async def get_market_sentiment(self) -> MarketSentiment:
        """Fetch market sentiment indicators."""
        return await self.provider.get_market_sentiment()

    async def get_asset_detail(self, ticker: str) -> Optional[AssetDetail]:
        """Fetch asset fundamental and technical profile."""
        return await self.provider.get_asset_detail(ticker)

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Fetch consolidated market overview."""
        return await self.provider.get_market_overview()
