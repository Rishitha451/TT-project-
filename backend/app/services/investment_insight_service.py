"""Investment insights deterministic rule-based business service."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.investment_repository import InvestmentRepository
from app.schemas.investment import (
    InvestmentInsight,
    InvestmentInsightAnalysis,
    InvestmentInsightFactor,
)


class InvestmentInsightService:
    """Service deriving deterministic, rule-based portfolio insights and risk considerations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = InvestmentRepository(db)

    async def get_investment_insights(self, user_id: str) -> List[InvestmentInsight]:
        """Generate rule-based insights for each user holding."""
        positions = await self.repo.get_all_positions_for_user(user_id)

        if not positions:
            return []

        total_value = sum((p.total_value for p in positions), Decimal("0.0000"))
        now_iso = datetime.now(timezone.utc).isoformat()
        insights: List[InvestmentInsight] = []

        for p in positions:
            alloc_pct = float((p.total_value / total_value) * Decimal("100")) if total_value > 0 else 0.0
            pnl_pct = float(p.pnl_pct)

            factors: List[InvestmentInsightFactor] = []
            reasoning: List[str] = []
            considerations: List[str] = []

            # 1. Performance / Momentum Factor
            if pnl_pct >= 10.0:
                momentum_signal = "Positive"
                mom_contrib = 85
                reasoning.append(f"Position shows positive return of +{pnl_pct:.2f}% since purchase.")
                considerations.append("✓ Strong capital appreciation momentum")
            elif pnl_pct >= 0.0:
                momentum_signal = "Neutral"
                mom_contrib = 60
                reasoning.append(f"Holding is tracking near cost basis with a modest return of +{pnl_pct:.2f}%.")
                considerations.append("✓ Stable cost basis tracking")
            else:
                momentum_signal = "Negative"
                mom_contrib = 40
                reasoning.append(f"Unrealized drawdown of {pnl_pct:.2f}% relative to initial cost basis.")
                considerations.append("⚠ Monitor price trend against long-term thesis")

            factors.append(InvestmentInsightFactor(name="Momentum & Performance", signal=momentum_signal, contribution=mom_contrib))

            # 2. Allocation & Weight Factor
            if alloc_pct > 30.0:
                alloc_signal = "High"
                alloc_contrib = 40
                action = "TRIM" if pnl_pct > 0 else "REBALANCE"
                reasoning.append(f"Holding accounts for {alloc_pct:.1f}% of total portfolio value, presenting high single-asset concentration.")
                considerations.append("⚠ Heavy concentration risk; consider rebalancing or trimming")
            elif alloc_pct > 15.0:
                alloc_signal = "Moderate"
                alloc_contrib = 75
                action = "HOLD"
                reasoning.append(f"Target allocation of {alloc_pct:.1f}% represents a core portfolio anchor.")
                considerations.append("✓ Balanced core allocation")
            else:
                alloc_signal = "Low"
                alloc_contrib = 80
                action = "BUY" if pnl_pct >= 0 else "HOLD"
                reasoning.append(f"Conservative allocation of {alloc_pct:.1f}% leaves headroom for gradual accumulation.")
                considerations.append("✓ Low portfolio concentration risk")

            factors.append(InvestmentInsightFactor(name="Portfolio Concentration", signal=alloc_signal, contribution=alloc_contrib))

            # 3. Asset Class Factor
            if p.asset_class == "ETF":
                factors.append(InvestmentInsightFactor(name="Broad Diversification", signal="Positive", contribution=92))
                reasoning.append("ETF structure provides diversified basket exposure.")
                considerations.append("✓ Broad index diversification")
                confidence = 90
                overall_signal = "Positive"
            elif p.asset_class == "Fixed Income":
                factors.append(InvestmentInsightFactor(name="Capital Preservation", signal="Positive", contribution=88))
                reasoning.append("Fixed income security provides steady income and downside hedge.")
                considerations.append("✓ Downside buffer and yield generation")
                confidence = 88
                overall_signal = "Positive"
            else:
                factors.append(InvestmentInsightFactor(name="Fundamental Growth", signal="Positive" if pnl_pct > 0 else "Neutral", contribution=70))
                confidence = 80 if pnl_pct > 0 else 68
                overall_signal = "Positive" if (pnl_pct >= 0 and alloc_pct <= 30) else "Neutral"

            insights.append(
                InvestmentInsight(
                    id=f"insight-{p.ticker.lower()}",
                    ticker=p.ticker,
                    name=p.name,
                    analysis=InvestmentInsightAnalysis(
                        overallSignal=overall_signal,
                        confidence=confidence,
                        factors=factors,
                    ),
                    reasoning=reasoning,
                    considerations=considerations,
                    timestamp=now_iso,
                    actionRecommendation=action,
                )
            )

        return insights
