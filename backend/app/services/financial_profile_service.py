"""Financial Profile business logic service handling baseline financials and onboarding."""

from decimal import Decimal
import logging
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.financial_profile import FinancialProfile
from app.models.goal import Goal
from app.models.user import User
from app.repositories.financial_profile_repository import FinancialProfileRepository
from app.repositories.goal_repository import GoalRepository
from app.schemas.financial_profile import (
    FinancialProfileCreate,
    FinancialProfileRead,
    FinancialProfileStatus,
    FinancialProfileUpdate,
)

logger = logging.getLogger(__name__)


class FinancialProfileService:
    """Service managing financial baseline setup, onboarding persistence, and profile updates."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.profile_repo = FinancialProfileRepository(db)
        self.goal_repo = GoalRepository(db)

    @staticmethod
    def _to_read_schema(profile: FinancialProfile) -> FinancialProfileRead:
        """Convert a database FinancialProfile model to the computed FinancialProfileRead schema."""
        total_monthly_income = profile.monthly_income + profile.additional_income
        
        # Calculate savings rate
        savings_rate = 0.0
        if total_monthly_income > Decimal("0"):
            savings_rate = round(float((profile.savings / total_monthly_income) * Decimal("100")), 1)

        # Calculate liquid savings: cash_balance + emergency_fund + current savings
        liquid_savings = profile.cash_balance + profile.emergency_fund + profile.savings

        # Calculate baseline net worth: liquid assets + non-liquid assets + investments - total debt
        net_worth = (
            profile.total_assets
            + profile.total_investments
            + profile.cash_balance
            + profile.savings
            - profile.total_debt
        )

        return FinancialProfileRead(
            id=profile.id,
            userId=profile.user_id,
            currency=profile.currency,
            employmentStatus=profile.employment_status,
            monthlyIncome=profile.monthly_income,
            additionalIncome=profile.additional_income,
            totalMonthlyIncome=total_monthly_income,
            incomeSources=profile.income_sources,
            monthlyExpenses=profile.monthly_expenses,
            expenseCategories=profile.expense_categories,
            savings=profile.savings,
            savingsRate=savings_rate,
            cashBalance=profile.cash_balance,
            emergencyFund=profile.emergency_fund,
            liquidSavings=liquid_savings,
            totalAssets=profile.total_assets,
            assetBreakdown=profile.asset_breakdown,
            totalInvestments=profile.total_investments,
            investmentBreakdown=profile.investment_breakdown,
            totalDebt=profile.total_debt,
            debtBreakdown=profile.debt_breakdown,
            netWorth=net_worth,
            riskProfile=profile.risk_profile,
            riskScore=profile.risk_score,
            onboardingCompleted=profile.onboarding_completed,
            createdAt=profile.created_at,
            updatedAt=profile.updated_at,
        )

    async def get_profile(self, user_id: str) -> Optional[FinancialProfileRead]:
        """Retrieve user's financial profile if present."""
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            return None
        return self._to_read_schema(profile)

    async def get_status(self, user_id: str) -> FinancialProfileStatus:
        """Check user's onboarding completion status."""
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            return FinancialProfileStatus(onboardingCompleted=False, hasProfile=False)
        return FinancialProfileStatus(
            onboardingCompleted=profile.onboarding_completed,
            hasProfile=True,
        )

    async def save_onboarding_profile(
        self,
        user: User,
        payload: FinancialProfileCreate,
    ) -> FinancialProfileRead:
        """
        Create or fully update financial profile baseline from onboarding flow.
        Also creates any provided initial goals and syncs base currency.
        """
        # 1. Authoritative calculations for sums
        monthly_income = payload.monthly_income
        additional_income = payload.additional_income
        total_income = monthly_income + additional_income

        # Expenses
        monthly_expenses = payload.monthly_expenses
        if payload.expense_categories and monthly_expenses == Decimal("0.0000"):
            cat_sum = sum(
                (Decimal(str(v)) for v in payload.expense_categories.values() if v is not None and str(v).replace('.', '', 1).isdigit()),
                Decimal("0.0000"),
            )
            if cat_sum > Decimal("0.0000"):
                monthly_expenses = cat_sum

        # Monthly Savings
        savings = payload.savings
        if savings == Decimal("0.0000") and total_income > monthly_expenses:
            savings = total_income - monthly_expenses

        # Assets
        total_assets = payload.total_assets
        if payload.asset_breakdown and total_assets == Decimal("0.0000"):
            asset_sum = sum(
                (Decimal(str(v)) for v in payload.asset_breakdown.values() if v is not None and str(v).replace('.', '', 1).isdigit()),
                Decimal("0.0000"),
            )
            if asset_sum > Decimal("0.0000"):
                total_assets = asset_sum

        # Investments
        total_investments = payload.total_investments
        if payload.investment_breakdown and total_investments == Decimal("0.0000"):
            inv_sum = Decimal("0.0000")
            for item in payload.investment_breakdown.values():
                if isinstance(item, dict) and "value" in item:
                    val = str(item["value"])
                    if val.replace('.', '', 1).isdigit():
                        inv_sum += Decimal(val)
                elif str(item).replace('.', '', 1).isdigit():
                    inv_sum += Decimal(str(item))
            if inv_sum > Decimal("0.0000"):
                total_investments = inv_sum

        # Debt
        total_debt = payload.total_debt
        if payload.debt_breakdown and total_debt == Decimal("0.0000"):
            debt_sum = Decimal("0.0000")
            for item in payload.debt_breakdown.values():
                if isinstance(item, dict) and "balance" in item:
                    bal = str(item["balance"])
                    if bal.replace('.', '', 1).isdigit():
                        debt_sum += Decimal(bal)
                elif str(item).replace('.', '', 1).isdigit():
                    debt_sum += Decimal(str(item))
            if debt_sum > Decimal("0.0000"):
                total_debt = debt_sum

        # 2. Check for existing profile or instantiate new
        profile = await self.profile_repo.get_by_user_id(user.id)
        if profile:
            profile.currency = payload.currency
            profile.employment_status = payload.employment_status
            profile.monthly_income = monthly_income
            profile.additional_income = additional_income
            profile.income_sources = payload.income_sources
            profile.monthly_expenses = monthly_expenses
            profile.expense_categories = payload.expense_categories
            profile.savings = savings
            profile.cash_balance = payload.cash_balance
            profile.emergency_fund = payload.emergency_fund
            profile.total_assets = total_assets
            profile.asset_breakdown = payload.asset_breakdown
            profile.total_investments = total_investments
            profile.investment_breakdown = payload.investment_breakdown
            profile.total_debt = total_debt
            profile.debt_breakdown = payload.debt_breakdown
            profile.risk_profile = payload.risk_profile
            profile.risk_score = payload.risk_score
            profile.onboarding_completed = payload.onboarding_completed
        else:
            profile = FinancialProfile(
                user_id=user.id,
                currency=payload.currency,
                employment_status=payload.employment_status,
                monthly_income=monthly_income,
                additional_income=additional_income,
                income_sources=payload.income_sources,
                monthly_expenses=monthly_expenses,
                expense_categories=payload.expense_categories,
                savings=savings,
                cash_balance=payload.cash_balance,
                emergency_fund=payload.emergency_fund,
                total_assets=total_assets,
                asset_breakdown=payload.asset_breakdown,
                total_investments=total_investments,
                investment_breakdown=payload.investment_breakdown,
                total_debt=total_debt,
                debt_breakdown=payload.debt_breakdown,
                risk_profile=payload.risk_profile,
                risk_score=payload.risk_score,
                onboarding_completed=payload.onboarding_completed,
            )
            self.db.add(profile)

        # 3. Handle initial financial goals if provided
        if payload.goals:
            for g in payload.goals:
                goal_record = Goal(
                    user_id=user.id,
                    name=g.name,
                    target_amount=g.target_amount,
                    current_amount=g.current_amount,
                    color=g.color or "#3B82F6",
                    category=g.category or "General",
                    target_date=g.target_date,
                    status="in_progress",
                )
                self.db.add(goal_record)

        # 4. Sync currency if needed
        if payload.currency and user.currency != payload.currency:
            user.currency = payload.currency
            if hasattr(user, 'settings') and user.settings:
                user.settings.currency = payload.currency

        await self.db.commit()
        await self.db.refresh(profile)

        return self._to_read_schema(profile)

    async def update_profile(
        self,
        user_id: str,
        payload: FinancialProfileUpdate,
    ) -> FinancialProfileRead:
        """Partially update user's financial profile."""
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            raise AppException(
                code="PROFILE_NOT_FOUND",
                message="Financial profile does not exist. Please complete initial onboarding.",
                status_code=404,
            )

        update_data = payload.model_dump(exclude_unset=True, by_alias=False)
        for field, value in update_data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)

        # Auto-update savings if income/expenses were updated and savings wasn't explicitly provided
        if "monthly_income" in update_data or "monthly_expenses" in update_data or "additional_income" in update_data:
            if "savings" not in update_data:
                total_income = profile.monthly_income + profile.additional_income
                if total_income > profile.monthly_expenses:
                    profile.savings = total_income - profile.monthly_expenses

        await self.db.commit()
        await self.db.refresh(profile)

        return self._to_read_schema(profile)
