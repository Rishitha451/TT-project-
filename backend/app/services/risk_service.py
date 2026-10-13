"""Risk evaluation and portfolio stress testing service."""

from collections import defaultdict
from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.investment_repository import InvestmentRepository
from app.schemas.investment import RiskExposure, RiskMetrics, RiskScenario


MOCK_SCENARIOS = [
    RiskScenario(
        id="sc_1",
        name="Fed Rate Hike (+50 bps)",
        description="Unexpected inflation pressure leading to short-term bond compression and growth stock multiple contraction.",
        estimatedImpactPct=-3.8,
        severity="medium",
        likelihood="Low",
    ),
    RiskScenario(
        id="sc_2",
        name="Broad Market Correction (-10%)",
        description="Macro slowdown triggering a 10% pullback across large-cap equity indexes.",
        estimatedImpactPct=-7.2,
        severity="high",
        likelihood="Moderate",
    ),
    RiskScenario(
        id="sc_3",
        name="Tech Sector Earnings Surge (+15%)",
        description="Enterprise AI deployments exceeding forecasts and lifting tech leaders.",
        estimatedImpactPct=6.4,
        severity="low",
        likelihood="High",
    ),
]


class RiskService:
    """Service evaluating portfolio concentration, volatility, and stress exposures."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = InvestmentRepository(db)

    async def get_risk_metrics(self, user_id: str) -> RiskMetrics:
        """Derive portfolio risk score, sector concentration, and scenario impacts."""
        positions = await self.repo.get_all_positions_for_user(user_id)

        if not positions:
            return RiskMetrics(
                volatility=0.0,
                beta=1.0,
                sharpeRatio=0.0,
                riskScore=0,
                riskLevel="Low",
                exposure=[],
                scenarios=MOCK_SCENARIOS,
            )

        total_value = sum((p.total_value for p in positions), Decimal("0.0000"))

        # 1. Sector & Asset Class Exposure
        sector_totals = defaultdict(lambda: Decimal("0.0000"))
        for p in positions:
            sec = p.sector or p.asset_class or "Diversified"
            sector_totals[sec] += p.total_value

        exposure_list: List[RiskExposure] = []
        for sec, sec_val in sorted(sector_totals.items(), key=lambda x: x[1], reverse=True):
            pct = round(float((sec_val / total_value) * Decimal("100")), 1) if total_value > 0 else 0.0
            exposure_list.append(RiskExposure(sector=sec, percentage=pct))

        # 2. Risk Score & Indicators
        # Heavy equity concentration increases risk score
        equity_val = sum(
            (p.total_value for p in positions if p.asset_class in ("Equity", "Commodity")),
            Decimal("0.0000"),
        )
        equity_ratio = float(equity_val / total_value) if total_value > 0 else 0.0

        # Max single stock concentration
        max_position_val = max((p.total_value for p in positions), default=Decimal("0.0000"))
        max_concentration = float(max_position_val / total_value) if total_value > 0 else 0.0

        # Weighted calculation
        risk_score = int(min(100, max(10, int(equity_ratio * 60 + max_concentration * 40))))

        if risk_score < 35:
            risk_level = "Low"
            volatility = 0.085
            beta = 0.65
            sharpe = 1.45
        elif risk_score < 65:
            risk_level = "Moderate"
            volatility = 0.142
            beta = 1.05
            sharpe = 1.20
        else:
            risk_level = "High"
            volatility = 0.225
            beta = 1.45
            sharpe = 0.85

        return RiskMetrics(
            volatility=volatility,
            beta=beta,
            sharpeRatio=sharpe,
            riskScore=risk_score,
            riskLevel=risk_level,
            exposure=exposure_list,
            scenarios=MOCK_SCENARIOS,
        )
