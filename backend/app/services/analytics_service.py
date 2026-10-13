"""Analytics and financial trends business service."""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.financial_profile_repository import FinancialProfileRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.analytics import (
    AnalyticsSummary,
    AnalyticsTrendPoint,
    TopExpenseCategory,
)
from app.schemas.dashboard import SpendingCategory

CATEGORY_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#64748B",
]


class AnalyticsService:
    """Service computing historical trends, cash flows, and category distributions."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.tx_repo = TransactionRepository(db)
        self.profile_repo = FinancialProfileRepository(db)

    @staticmethod
    def _parse_timeframe_delta(timeframe: str) -> Optional[datetime]:
        """Convert timeframe code to start datetime in UTC."""
        now = datetime.now(timezone.utc)
        timeframe = timeframe.lower()
        if timeframe == "1m":
            return now - timedelta(days=30)
        elif timeframe == "3m":
            return now - timedelta(days=90)
        elif timeframe == "6m":
            return now - timedelta(days=180)
        elif timeframe == "1y":
            return now - timedelta(days=365)
        elif timeframe == "all":
            return None
        return now - timedelta(days=180)  # default 6m

    async def get_analytics_summary(
        self,
        user_id: str,
        timeframe: str = "6m",
    ) -> AnalyticsSummary:
        """Compute complete analytics summary for the specified window."""
        start_date = self._parse_timeframe_delta(timeframe)
        now = datetime.now(timezone.utc)

        # 1. Check transactions for period
        totals = await self.tx_repo.get_cashflow_totals_by_user(
            user_id=user_id,
            start_date=start_date,
            end_date=now,
        )
        has_txs = totals["credit"] > 0 or totals["debit"] > 0

        if has_txs:
            total_income = totals["credit"]
            total_expenses = totals["debit"]
            net_savings = total_income - total_expenses

            savings_rate = 0.0
            if total_income > Decimal("0"):
                savings_rate = round(float((net_savings / total_income) * Decimal("100")), 1)

            # Monthly Trend Points from real transactions
            txs = await self.tx_repo.get_by_user_paginated(
                user_id=user_id,
                skip=0,
                limit=1000,
                start_date=start_date,
                end_date=now,
                sort_by="date",
                sort_order="asc",
            )

            monthly_map: Dict[str, Dict[str, Decimal]] = defaultdict(
                lambda: {"credit": Decimal("0.0000"), "debit": Decimal("0.0000")}
            )

            for tx in txs:
                month_key = tx.date.strftime("%b %Y")
                monthly_map[month_key][tx.type] += tx.amount

            monthly_trends: List[AnalyticsTrendPoint] = []
            for month_label, flow in monthly_map.items():
                m_income = flow["credit"]
                m_expenses = flow["debit"]
                m_savings = m_income - m_expenses
                monthly_trends.append(
                    AnalyticsTrendPoint(
                        month=month_label,
                        income=m_income,
                        expenses=m_expenses,
                        savings=m_savings,
                    )
                )

            # Category Spending Breakdown
            category_spending_raw = await self.tx_repo.get_category_spending_by_user(
                user_id=user_id,
                start_date=start_date,
                end_date=now,
            )

            category_breakdown: List[SpendingCategory] = []
            top_expenses: List[TopExpenseCategory] = []

            for i, (cat, amount) in enumerate(category_spending_raw):
                pct = round(float((amount / total_expenses) * Decimal("100")), 1) if total_expenses > 0 else 0.0
                color = CATEGORY_COLORS[i % len(CATEGORY_COLORS)]
                category_breakdown.append(
                    SpendingCategory(
                        category=cat,
                        amount=amount,
                        color=color,
                        percentage=pct,
                    )
                )
                if len(top_expenses) < 5:
                    top_expenses.append(
                        TopExpenseCategory(
                            category=cat,
                            amount=amount,
                            percentage=pct,
                        )
                    )

            return AnalyticsSummary(
                timeframe=timeframe,
                total_income=total_income,
                total_expenses=total_expenses,
                net_savings=net_savings,
                savings_rate=savings_rate,
                monthly_trends=monthly_trends,
                category_breakdown=category_breakdown,
                top_expenses=top_expenses,
            )

        # Fallback to FinancialProfile Baseline if no transactions exist
        profile = await self.profile_repo.get_by_user_id(user_id)
        if profile and profile.onboarding_completed:
            total_income = profile.monthly_income + profile.additional_income
            total_expenses = profile.monthly_expenses
            net_savings = profile.savings
            savings_rate = 0.0
            if total_income > Decimal("0"):
                savings_rate = round(float((net_savings / total_income) * Decimal("100")), 1)

            # Single trend point for the current active month
            monthly_trends = [
                AnalyticsTrendPoint(
                    month=now.strftime("%b %Y"),
                    income=total_income,
                    expenses=total_expenses,
                    savings=net_savings,
                )
            ]

            category_breakdown = []
            top_expenses = []
            if profile.expense_categories and isinstance(profile.expense_categories, dict):
                total_exp = sum(
                    (Decimal(str(v)) for v in profile.expense_categories.values() if v is not None and str(v).replace('.', '', 1).isdigit()),
                    Decimal("0.0000"),
                )
                i = 0
                for cat, val in profile.expense_categories.items():
                    if val is not None and str(val).replace('.', '', 1).isdigit():
                        amt = Decimal(str(val))
                        if amt > Decimal("0.0000"):
                            pct = round(float((amt / total_exp) * Decimal("100")), 1) if total_exp > 0 else 0.0
                            color = CATEGORY_COLORS[i % len(CATEGORY_COLORS)]
                            category_breakdown.append(
                                SpendingCategory(
                                    category=cat,
                                    amount=amt,
                                    color=color,
                                    percentage=pct,
                                )
                            )
                            if len(top_expenses) < 5:
                                top_expenses.append(
                                    TopExpenseCategory(
                                        category=cat,
                                        amount=amt,
                                        percentage=pct,
                                    )
                                )
                            i += 1

            return AnalyticsSummary(
                timeframe=timeframe,
                total_income=total_income,
                total_expenses=total_expenses,
                net_savings=net_savings,
                savings_rate=savings_rate,
                monthly_trends=monthly_trends,
                category_breakdown=category_breakdown,
                top_expenses=top_expenses,
            )

        # Honest Empty State
        return AnalyticsSummary(
            timeframe=timeframe,
            total_income=Decimal("0.0000"),
            total_expenses=Decimal("0.0000"),
            net_savings=Decimal("0.0000"),
            savings_rate=0.0,
            monthly_trends=[],
            category_breakdown=[],
            top_expenses=[],
        )
