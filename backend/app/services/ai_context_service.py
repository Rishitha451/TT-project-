"""Financial context aggregation and minimization service for AI Advisor."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.financial_profile_repository import FinancialProfileRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.investment_repository import InvestmentRepository
from app.repositories.transaction_repository import TransactionRepository
from app.services.investment_summary_service import InvestmentSummaryService
from app.services.risk_service import RiskService


class AIContextService:
    """Builds minimized, validated financial context based on query intent and user baseline profile."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.tx_repo = TransactionRepository(db)
        self.goal_repo = GoalRepository(db)
        self.inv_repo = InvestmentRepository(db)
        self.inv_summary_service = InvestmentSummaryService(db)
        self.risk_service = RiskService(db)
        self.profile_repo = FinancialProfileRepository(db)

    async def build_context(
        self,
        user: User,
        intent: str,
    ) -> Tuple[str, List[str], Dict[str, Any]]:
        """Construct normalized financial context and return (context_str, sources, raw_data_dict)."""
        now = datetime.now(timezone.utc)
        start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        currency = user.currency or "INR"

        sources: List[str] = []
        context_blocks: List[str] = []
        raw_data: Dict[str, Any] = {"currency": currency, "user_name": user.name}

        # User Profile Block
        context_blocks.append(f"User: {user.name} (Preferred Currency: {currency})")

        # -------------------------------------------------------------------
        # Domain 0: Financial Profile Baseline
        # -------------------------------------------------------------------
        profile = await self.profile_repo.get_by_user_id(user.id)
        if profile and profile.onboarding_completed:
            sources.append("financial_profile")
            total_income = profile.monthly_income + profile.additional_income
            savings_rate = float((profile.savings / total_income) * 100) if total_income > 0 else 0.0
            liquid_savings = profile.cash_balance + profile.emergency_fund + profile.savings
            profile_net_worth = (
                profile.total_assets
                + profile.total_investments
                + profile.cash_balance
                + profile.savings
                - profile.total_debt
            )

            raw_data["financial_profile"] = {
                "employment_status": profile.employment_status,
                "monthly_income": profile.monthly_income,
                "additional_income": profile.additional_income,
                "total_monthly_income": total_income,
                "monthly_expenses": profile.monthly_expenses,
                "monthly_savings": profile.savings,
                "savings_rate": savings_rate,
                "cash_balance": profile.cash_balance,
                "emergency_fund": profile.emergency_fund,
                "liquid_savings": liquid_savings,
                "total_assets": profile.total_assets,
                "total_investments": profile.total_investments,
                "total_debt": profile.total_debt,
                "risk_profile": profile.risk_profile,
                "risk_score": profile.risk_score,
                "net_worth": profile_net_worth,
                "expense_categories": profile.expense_categories,
                "debt_breakdown": profile.debt_breakdown,
                "asset_breakdown": profile.asset_breakdown,
                "investment_breakdown": profile.investment_breakdown,
            }

            profile_lines = [
                "--- FINANCIAL PROFILE (USER BASELINE) ---",
                f"Employment Status: {profile.employment_status or 'Not Specified'}",
                f"Total Monthly Income: {currency} {total_income:,.2f} (Primary: {currency} {profile.monthly_income:,.2f}, Additional: {currency} {profile.additional_income:,.2f})",
                f"Monthly Expenses: {currency} {profile.monthly_expenses:,.2f}",
                f"Monthly Savings: {currency} {profile.savings:,.2f} (Savings Rate: {savings_rate:.1f}%)",
                f"Cash & Bank Balance: {currency} {profile.cash_balance:,.2f}",
                f"Emergency Fund: {currency} {profile.emergency_fund:,.2f}",
                f"Total Liquid Reserves: {currency} {liquid_savings:,.2f}",
                f"Total Assets: {currency} {profile.total_assets:,.2f}",
                f"Total Investments (Manual): {currency} {profile.total_investments:,.2f}",
                f"Total Debt / Liabilities: {currency} {profile.total_debt:,.2f}",
                f"Risk Tolerance Tier: {profile.risk_profile} (Score: {profile.risk_score}/100)",
                f"Baseline Net Worth: {currency} {profile_net_worth:,.2f}",
            ]
            context_blocks.append("\n".join(profile_lines))

        # -------------------------------------------------------------------
        # Domain 1: Spending & Transactions
        # -------------------------------------------------------------------
        if intent in ("SPENDING_ANALYSIS", "TRANSACTIONS", "BUDGETING", "SAVINGS", "GOALS", "FINANCIAL_SUMMARY", "GENERAL_FINANCE"):
            month_totals = await self.tx_repo.get_cashflow_totals_by_user(user.id, start_date=start_of_month)
            m_income = month_totals["credit"]
            m_expense = month_totals["debit"]
            has_txs = m_income > 0 or m_expense > 0

            if has_txs:
                sources.append("transactions")
                sources.append("analytics")
                m_savings = m_income - m_expense
                savings_rate = float((m_savings / m_income) * 100) if m_income > 0 else 0.0

                raw_data["monthly_income"] = m_income
                raw_data["monthly_expenses"] = m_expense
                raw_data["monthly_savings"] = m_savings
                raw_data["savings_rate"] = savings_rate

                categories_raw = await self.tx_repo.get_category_spending_by_user(user.id, start_date=start_of_month)
                raw_data["categories"] = categories_raw

                recent_txs = await self.tx_repo.get_by_user_paginated(user.id, skip=0, limit=5, sort_by="date", sort_order="desc")
                raw_data["recent_transactions"] = recent_txs

                spending_lines = [
                    f"--- CURRENT MONTH TRANSACTIONS ({now.strftime('%B %Y')}) ---",
                    f"Total Income: {currency} {m_income:,.2f}",
                    f"Total Expenses: {currency} {m_expense:,.2f}",
                    f"Net Savings: {currency} {m_savings:,.2f} (Savings Rate: {savings_rate:.1f}%)",
                ]

                if categories_raw:
                    spending_lines.append("Top Spending Categories:")
                    for cat, amt in categories_raw[:5]:
                        pct = float((amt / m_expense) * 100) if m_expense > 0 else 0.0
                        spending_lines.append(f"  - {cat}: {currency} {amt:,.2f} ({pct:.1f}% of expenses)")

                if recent_txs:
                    spending_lines.append("Recent Transactions:")
                    for tx in recent_txs:
                        spending_lines.append(f"  - {tx.date.strftime('%b %d')}: {tx.title} ({tx.category}) = {currency} {tx.amount:,.2f} [{tx.type.upper()}]")

                context_blocks.append("\n".join(spending_lines))
            elif profile and profile.onboarding_completed:
                # Use profile baseline for cashflow context
                raw_data["monthly_income"] = raw_data["financial_profile"]["total_monthly_income"]
                raw_data["monthly_expenses"] = raw_data["financial_profile"]["monthly_expenses"]
                raw_data["monthly_savings"] = raw_data["financial_profile"]["monthly_savings"]
                raw_data["savings_rate"] = raw_data["financial_profile"]["savings_rate"]
                if profile.expense_categories:
                    raw_data["categories"] = [(k, Decimal(str(v))) for k, v in profile.expense_categories.items() if v]
            else:
                raw_data["monthly_income"] = Decimal("0")
                raw_data["monthly_expenses"] = Decimal("0")
                raw_data["monthly_savings"] = Decimal("0")
                raw_data["savings_rate"] = 0.0

        # -------------------------------------------------------------------
        # Domain 2: Goals & Milestones
        # -------------------------------------------------------------------
        if intent in ("SAVINGS", "GOALS", "BUDGETING", "FINANCIAL_SUMMARY", "GENERAL_FINANCE"):
            sources.append("goals")
            goals = await self.goal_repo.get_by_user(user.id, status="in_progress")
            raw_data["goals"] = goals

            if goals:
                goal_lines = ["--- ACTIVE FINANCIAL GOALS ---"]
                for g in goals:
                    progress = float((g.current_amount / g.target_amount) * 100) if g.target_amount > 0 else 0.0
                    goal_lines.append(f"  - Goal: {g.name} | Target: {currency} {g.target_amount:,.2f} | Current: {currency} {g.current_amount:,.2f} ({progress:.1f}% funded)")
                context_blocks.append("\n".join(goal_lines))
            else:
                context_blocks.append("--- ACTIVE FINANCIAL GOALS ---\nNo active financial goals currently configured.")

        # -------------------------------------------------------------------
        # Domain 3: Investments & Risk
        # -------------------------------------------------------------------
        if intent in ("INVESTMENTS", "RISK", "FINANCIAL_SUMMARY", "GENERAL_FINANCE"):
            sources.append("portfolio")
            inv_summary = await self.inv_summary_service.get_portfolio_summary(user.id)
            positions = await self.inv_repo.get_all_positions_for_user(user.id)
            raw_data["investment_summary"] = inv_summary
            raw_data["positions"] = positions

            inv_lines = [
                "--- INVESTMENT PORTFOLIO SNAPSHOT ---",
                f"Total Market Value: ${inv_summary.total_value:,.2f}",
                f"Total Invested (Cost Basis): ${inv_summary.total_invested:,.2f}",
                f"Unrealized P&L: ${inv_summary.overall_pnl:,.2f} ({inv_summary.overall_pnl_pct:+.2f}%)",
                f"Derived Risk Profile: {inv_summary.risk_level}",
                f"General Market Sentiment: {inv_summary.market_sentiment}",
            ]

            if positions:
                inv_lines.append("Holdings Breakdown:")
                total_val = inv_summary.total_value
                for p in positions:
                    alloc = float((p.total_value / total_val) * 100) if total_val > 0 else 0.0
                    inv_lines.append(f"  - {p.ticker} ({p.name}): {p.shares} shares @ ${p.current_price:,.2f} | Value: ${p.total_value:,.2f} | PnL: {p.pnl_pct:+.2f}% | Allocation: {alloc:.1f}% [{p.asset_class}]")

            context_blocks.append("\n".join(inv_lines))

            if intent in ("RISK", "INVESTMENTS", "FINANCIAL_SUMMARY"):
                sources.append("risk")
                risk_metrics = await self.risk_service.get_risk_metrics(user.id)
                raw_data["risk_metrics"] = risk_metrics
                risk_lines = [
                    "--- PORTFOLIO RISK & EXPOSURE ---",
                    f"Overall Risk Score: {risk_metrics.risk_score}/100 ({risk_metrics.risk_level})",
                    f"Portfolio Beta: {risk_metrics.beta:.2f} | Estimated Volatility: {risk_metrics.volatility:.3f} | Sharpe Ratio: {risk_metrics.sharpe_ratio:.2f}",
                ]
                if risk_metrics.exposure:
                    risk_lines.append("Sector Exposures:")
                    for exp in risk_metrics.exposure:
                        risk_lines.append(f"  - {exp.sector}: {exp.percentage:.1f}%")
                context_blocks.append("\n".join(risk_lines))

        # -------------------------------------------------------------------
        # Domain 4: All-time Net Worth (for summary queries)
        # -------------------------------------------------------------------
        if intent in ("FINANCIAL_SUMMARY", "GENERAL_FINANCE"):
            all_time = await self.tx_repo.get_cashflow_totals_by_user(user.id)
            tx_net = all_time["credit"] - all_time["debit"]
            base_nw = raw_data.get("financial_profile", {}).get("net_worth", Decimal("0"))
            net_worth = base_nw + tx_net
            raw_data["net_worth"] = net_worth
            context_blocks.insert(1, f"--- OVERALL NET WORTH ---\nEstimated Net Worth: {currency} {net_worth:,.2f}")

        # Final Context XML Wrapper
        context_str = "<FINANCIAL_CONTEXT>\n" + "\n\n".join(context_blocks) + "\n</FINANCIAL_CONTEXT>"
        return context_str, list(dict.fromkeys(sources)), raw_data
