"""Dashboard aggregation and financial metrics service."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal
from app.repositories.financial_profile_repository import FinancialProfileRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.dashboard import (
    DashboardData,
    FinancialInsight,
    FinancialSummary,
    SpendingCategory,
)
from app.schemas.transaction import TransactionRead

# Curated accessible chart palette colors
CATEGORY_COLORS = [
    "#3B82F6",  # Blue
    "#10B981",  # Emerald
    "#F59E0B",  # Amber
    "#EF4444",  # Red
    "#8B5CF6",  # Purple
    "#EC4899",  # Pink
    "#06B6D4",  # Cyan
    "#64748B",  # Slate
]


class DashboardService:
    """Service deriving real-time financial snapshot, profile baselines, and aggregations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.tx_repo = TransactionRepository(db)
        self.goal_repo = GoalRepository(db)
        self.profile_repo = FinancialProfileRepository(db)

    async def get_dashboard_data(self, user_id: str) -> DashboardData:
        """Aggregate user's canonical financial metrics, baseline profile, spending, and recent activity."""
        now = datetime.now(timezone.utc)
        # Start of current month
        start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        date_str = now.strftime("%b %d, %Y")

        # 1. Fetch Financial Profile Baseline
        profile = await self.profile_repo.get_by_user_id(user_id)
        has_completed_profile = profile is not None and profile.onboarding_completed

        # 2. Lifetime totals from transactions
        all_time_totals = await self.tx_repo.get_cashflow_totals_by_user(user_id)
        has_transactions_all_time = all_time_totals["credit"] > 0 or all_time_totals["debit"] > 0
        tx_net_worth = all_time_totals["credit"] - all_time_totals["debit"]

        # 3. Current Month Cashflow from transactions
        month_totals = await self.tx_repo.get_cashflow_totals_by_user(
            user_id=user_id,
            start_date=start_of_month,
        )
        has_current_month_txs = month_totals["credit"] > 0 or month_totals["debit"] > 0

        # 4. Resolve Monthly Figures (Transactions prioritized, Baseline Profile fallback)
        if has_current_month_txs:
            monthly_income = month_totals["credit"]
            monthly_expenses = month_totals["debit"]
            savings = monthly_income - monthly_expenses
            savings_rate = 0.0
            if monthly_income > Decimal("0"):
                savings_rate = round(float((savings / monthly_income) * Decimal("100")), 1)

            # Spending categories from transactions
            category_spending_raw = await self.tx_repo.get_category_spending_by_user(
                user_id=user_id,
                start_date=start_of_month,
            )
            total_spending = sum((amount for _, amount in category_spending_raw), Decimal("0.0000"))
            spending_categories: List[SpendingCategory] = []
            for i, (cat, amount) in enumerate(category_spending_raw[:6]):
                pct = round(float((amount / total_spending) * Decimal("100")), 1) if total_spending > 0 else 0.0
                color = CATEGORY_COLORS[i % len(CATEGORY_COLORS)]
                spending_categories.append(
                    SpendingCategory(
                        category=cat,
                        amount=amount,
                        color=color,
                        percentage=pct,
                    )
                )
        elif has_completed_profile and profile is not None:
            # Use Financial Profile Baseline
            monthly_income = profile.monthly_income + profile.additional_income
            monthly_expenses = profile.monthly_expenses
            savings = profile.savings
            savings_rate = 0.0
            if monthly_income > Decimal("0"):
                savings_rate = round(float((savings / monthly_income) * Decimal("100")), 1)

            # Spending categories from Profile
            spending_categories = []
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
                            spending_categories.append(
                                SpendingCategory(
                                    category=cat,
                                    amount=amt,
                                    color=color,
                                    percentage=pct,
                                )
                            )
                            i += 1
        else:
            # Clean Empty State (no transactions and no profile)
            monthly_income = Decimal("0.0000")
            monthly_expenses = Decimal("0.0000")
            savings = Decimal("0.0000")
            savings_rate = 0.0
            spending_categories = []

        # 5. Resolve Net Worth
        if has_completed_profile and profile is not None:
            base_net_worth = (
                profile.total_assets
                + profile.total_investments
                + profile.cash_balance
                + profile.savings
                - profile.total_debt
            )
            net_worth = base_net_worth + tx_net_worth
        elif has_transactions_all_time:
            net_worth = tx_net_worth
        else:
            net_worth = Decimal("0.0000")

        summary = FinancialSummary(
            net_worth=net_worth,
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            savings=savings,
            savings_rate=savings_rate,
        )

        # 6. Recent Transactions (Top 5)
        recent_txs_raw = await self.tx_repo.get_by_user_paginated(
            user_id=user_id,
            skip=0,
            limit=5,
            sort_by="date",
            sort_order="desc",
        )
        transactions = [TransactionRead.model_validate(t) for t in recent_txs_raw]

        # 7. Deterministic Financial Insights
        insights: List[FinancialInsight] = []

        if not has_completed_profile and not has_transactions_all_time:
            insights.append(
                FinancialInsight(
                    id="insight-onboarding-needed",
                    title="Financial Setup Incomplete",
                    description="Complete your financial baseline setup to unlock tailored analytics, budgeting targets, and AI financial guidance.",
                    type="info",
                    date=date_str,
                    category="Getting Started",
                    action_url="/app/settings",
                )
            )
        else:
            if savings_rate >= 20.0:
                insights.append(
                    FinancialInsight(
                        id="insight-savings-healthy",
                        title="Healthy Savings Rate",
                        description=f"You are saving {savings_rate}% of your income this month. Excellent financial discipline!",
                        type="success",
                        date=date_str,
                        category="Savings",
                    )
                )
            elif savings < Decimal("0"):
                insights.append(
                    FinancialInsight(
                        id="insight-expenses-alert",
                        title="Monthly Outflow Exceeds Income",
                        description="Your expenses have exceeded your income this month. Review your non-essential spending.",
                        type="warning",
                        date=date_str,
                        category="Budget",
                    )
                )

            # Check goals progress
            goals = await self.goal_repo.get_by_user(user_id=user_id, status="in_progress")
            if goals:
                first_goal = goals[0]
                progress = (
                    float(first_goal.current_amount / first_goal.target_amount * 100)
                    if first_goal.target_amount > 0
                    else 0
                )
                insights.append(
                    FinancialInsight(
                        id="insight-goal-progress",
                        title=f"Goal Progress: {first_goal.name}",
                        description=f"You have reached {progress:.1f}% of your target amount.",
                        type="info",
                        date=date_str,
                        category="Goals",
                    )
                )

        if not insights:
            insights.append(
                FinancialInsight(
                    id="insight-welcome",
                    title="Welcome to AI Finance Advisor",
                    description="Track transactions and set financial goals to unlock automated intelligence.",
                    type="info",
                    date=date_str,
                    category="Getting Started",
                )
            )

        return DashboardData(
            summary=summary,
            net_worth=net_worth,
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            savings=savings,
            spending=spending_categories,
            transactions=transactions,
            insights=insights,
        )
