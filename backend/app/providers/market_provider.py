"""Market data provider abstraction and deterministic mock implementation."""

from typing import Dict, List, Optional, Protocol
from app.schemas.investment import (
    AssetDetail,
    HistoricalReturn,
    MarketIndex,
    MarketNewsItem,
    MarketOverviewResponse,
    MarketSentiment,
)


class MarketDataProvider(Protocol):
    """Protocol interface for external / mock market intelligence providers."""

    async def get_market_indices(self) -> List[MarketIndex]:
        """Fetch major benchmark market indices."""
        ...

    async def get_market_news(self) -> List[MarketNewsItem]:
        """Fetch market financial news feeds."""
        ...

    async def get_market_sentiment(self) -> MarketSentiment:
        """Fetch market sentiment indicators."""
        ...

    async def get_asset_detail(self, ticker: str) -> Optional[AssetDetail]:
        """Fetch asset fundamental and technical profile."""
        ...

    async def get_market_overview(self) -> MarketOverviewResponse:
        """Fetch consolidated market overview."""
        ...


class DeterministicMockMarketProvider:
    """Deterministic, production-contract market provider with zero random drift."""

    MOCK_INDICES: List[MarketIndex] = [
        MarketIndex(symbol="S&P 500", name="S&P 500 Index", value=5482.60, change=18.40, changePct=0.34),
        MarketIndex(symbol="NASDAQ", name="Nasdaq Composite", value=17340.25, change=92.15, changePct=0.53),
        MarketIndex(symbol="DOW", name="Dow Jones Industrial", value=41240.80, change=-45.20, changePct=-0.11),
        MarketIndex(symbol="US 10Y", name="10-Year Treasury Yield", value=4.18, change=-0.04, changePct=-0.95),
        MarketIndex(symbol="GOLD", name="Gold Spot / oz", value=2658.40, change=14.80, changePct=0.56),
    ]

    MOCK_NEWS: List[MarketNewsItem] = [
        MarketNewsItem(
            id="n1",
            headline="Fed signals monetary easing trajectory as inflation indicators moderate",
            source="Financial Times",
            time="2 hours ago",
            sentiment="positive",
            ticker="SPY",
            change=0.85,
            category="Macro",
        ),
        MarketNewsItem(
            id="n2",
            headline="Enterprise AI infrastructure demand accelerates cloud revenue for top tech",
            source="Reuters",
            time="4 hours ago",
            sentiment="positive",
            ticker="MSFT",
            change=1.43,
            category="Tech",
        ),
        MarketNewsItem(
            id="n3",
            headline="Semiconductor supply chain adjusts to next-generation wafer packaging cycles",
            source="Bloomberg",
            time="7 hours ago",
            sentiment="neutral",
            ticker="NVDA",
            change=-0.62,
            category="Equities",
        ),
        MarketNewsItem(
            id="n4",
            headline="Treasury yields tick lower following robust primary auction demand",
            source="Wall Street Journal",
            time="12 hours ago",
            sentiment="positive",
            ticker="BND",
            change=0.16,
            category="Macro",
        ),
        MarketNewsItem(
            id="n5",
            headline="Consumer discretionary spending reflects seasonal back-to-school resilience",
            source="CNBC",
            time="1 day ago",
            sentiment="positive",
            ticker="AAPL",
            change=1.24,
            category="Equities",
        ),
    ]

    MOCK_SENTIMENT: MarketSentiment = MarketSentiment(
        score=68.5,
        label="Bullish",
        volatilityIndex=14.2,
        historicalScores=[45.0, 48.0, 42.0, 55.0, 60.0, 58.0, 62.0, 65.0, 68.0, 68.5],
    )

    KNOWN_ASSET_DETAILS: Dict[str, AssetDetail] = {
        "AAPL": AssetDetail(
            ticker="AAPL",
            name="Apple Inc.",
            sector="Consumer Electronics & Services",
            currentPrice=175.50,
            dayChange=2.15,
            dayChangePct=1.24,
            high52W=198.23,
            low52W=147.80,
            marketCap="$2.72 Trillion",
            peRatio=28.4,
            dividendYield=0.58,
            beta=1.12,
            volume="54.2M",
            description="Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.",
            historicalReturns=[
                HistoricalReturn(period="1M", returnPct=3.4),
                HistoricalReturn(period="3M", returnPct=8.2),
                HistoricalReturn(period="6M", returnPct=12.5),
                HistoricalReturn(period="1Y", returnPct=18.7),
                HistoricalReturn(period="3Y", returnPct=44.2),
            ],
        ),
        "MSFT": AssetDetail(
            ticker="MSFT",
            name="Microsoft Corp.",
            sector="Enterprise Software & Cloud",
            currentPrice=340.20,
            dayChange=4.80,
            dayChangePct=1.43,
            high52W=366.78,
            low52W=275.30,
            marketCap="$2.53 Trillion",
            peRatio=32.1,
            dividendYield=0.88,
            beta=0.95,
            volume="22.8M",
            description="Microsoft Corporation develops and supports software, services, devices and solutions including Azure and Copilot AI.",
            historicalReturns=[
                HistoricalReturn(period="1M", returnPct=2.8),
                HistoricalReturn(period="3M", returnPct=6.9),
                HistoricalReturn(period="6M", returnPct=14.1),
                HistoricalReturn(period="1Y", returnPct=24.3),
                HistoricalReturn(period="3Y", returnPct=56.8),
            ],
        ),
        "VOO": AssetDetail(
            ticker="VOO",
            name="Vanguard S&P 500 ETF",
            sector="Large-Cap Blend ETF",
            currentPrice=415.30,
            dayChange=1.85,
            dayChangePct=0.45,
            high52W=432.10,
            low52W=360.50,
            marketCap="$380 Billion",
            peRatio=22.8,
            dividendYield=1.42,
            beta=1.00,
            volume="4.1M",
            description="Vanguard S&P 500 ETF tracks the benchmark S&P 500 index representing the 500 largest US public corporations.",
            historicalReturns=[
                HistoricalReturn(period="1M", returnPct=1.9),
                HistoricalReturn(period="3M", returnPct=4.7),
                HistoricalReturn(period="6M", returnPct=9.8),
                HistoricalReturn(period="1Y", returnPct=16.2),
                HistoricalReturn(period="3Y", returnPct=32.5),
            ],
        ),
        "NVDA": AssetDetail(
            ticker="NVDA",
            name="NVIDIA Corporation",
            sector="Semiconductors & AI Compute",
            currentPrice=512.40,
            dayChange=-3.20,
            dayChangePct=-0.62,
            high52W=550.00,
            low52W=240.00,
            marketCap="$1.26 Trillion",
            peRatio=48.6,
            dividendYield=0.08,
            beta=1.65,
            volume="48.5M",
            description="NVIDIA designs graphics processing units (GPUs) and accelerated computing platforms powering artificial intelligence.",
            historicalReturns=[
                HistoricalReturn(period="1M", returnPct=-2.1),
                HistoricalReturn(period="3M", returnPct=18.4),
                HistoricalReturn(period="6M", returnPct=38.2),
                HistoricalReturn(period="1Y", returnPct=92.5),
                HistoricalReturn(period="3Y", returnPct=185.0),
            ],
        ),
        "BND": AssetDetail(
            ticker="BND",
            name="Vanguard Total Bond Market ETF",
            sector="Broad Fixed Income",
            currentPrice=74.20,
            dayChange=0.12,
            dayChangePct=0.16,
            high52W=76.50,
            low52W=69.80,
            marketCap="$104 Billion",
            peRatio=0.0,
            dividendYield=4.15,
            beta=0.18,
            volume="6.8M",
            description="Vanguard Total Bond Market ETF provides broad exposure to investment-grade U.S. debt securities.",
            historicalReturns=[
                HistoricalReturn(period="1M", returnPct=0.6),
                HistoricalReturn(period="3M", returnPct=1.4),
                HistoricalReturn(period="6M", returnPct=2.8),
                HistoricalReturn(period="1Y", returnPct=5.1),
                HistoricalReturn(period="3Y", returnPct=-1.8),
            ],
        ),
    }

    async def get_market_indices(self) -> List[MarketIndex]:
        return self.MOCK_INDICES

    async def get_market_news(self) -> List[MarketNewsItem]:
        return self.MOCK_NEWS

    async def get_market_sentiment(self) -> MarketSentiment:
        return self.MOCK_SENTIMENT

    async def get_asset_detail(self, ticker: str) -> Optional[AssetDetail]:
        symbol = ticker.strip().upper()
        if symbol in self.KNOWN_ASSET_DETAILS:
            return self.KNOWN_ASSET_DETAILS[symbol]
        # Return structured fallback for unknown tickers
        return AssetDetail(
            ticker=symbol,
            name=f"{symbol} Corporation",
            sector="Diversified Equities",
            currentPrice=100.00,
            dayChange=0.50,
            dayChangePct=0.50,
            high52W=120.00,
            low52W=85.00,
            marketCap="$10 Billion",
            peRatio=18.5,
            dividendYield=1.5,
            beta=1.0,
            volume="1.0M",
            description=f"Publicly traded securities profile for {symbol}.",
            historicalReturns=[
                HistoricalReturn(period="1M", returnPct=1.0),
                HistoricalReturn(period="3M", returnPct=3.0),
                HistoricalReturn(period="1Y", returnPct=8.0),
            ],
        )

    async def get_market_overview(self) -> MarketOverviewResponse:
        return MarketOverviewResponse(
            indices=self.MOCK_INDICES,
            news=self.MOCK_NEWS,
            sentiment=self.MOCK_SENTIMENT,
        )


# Global default market provider instance
default_market_provider = DeterministicMockMarketProvider()
