"""Pydantic schemas for Financial Profile and Onboarding baseline."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GoalCreateOnboarding(BaseModel):
    """Initial financial goal created during onboarding flow."""
    name: str = Field(..., min_length=1, max_length=255)
    target_amount: Decimal = Field(..., gt=0, alias="targetAmount")
    current_amount: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="currentAmount")
    color: str = Field(default="#3B82F6")
    category: Optional[str] = Field(default="General")
    target_date: Optional[datetime] = Field(default=None, alias="targetDate")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class FinancialProfileCreate(BaseModel):
    """Payload for submitting manual financial onboarding data."""
    currency: str = Field(default="INR", max_length=10)
    employment_status: Optional[str] = Field(default=None, alias="employmentStatus", max_length=100)
    
    # Monthly Income
    monthly_income: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="monthlyIncome")
    additional_income: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="additionalIncome")
    income_sources: Optional[Dict[str, Any]] = Field(default=None, alias="incomeSources")

    # Monthly Expenses
    monthly_expenses: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="monthlyExpenses")
    expense_categories: Optional[Dict[str, Any]] = Field(default=None, alias="expenseCategories")

    # Savings & Cash
    savings: Decimal = Field(default=Decimal("0.0000"), ge=0)
    cash_balance: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="cashBalance")
    emergency_fund: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="emergencyFund")

    # Assets & Investments
    total_assets: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="totalAssets")
    asset_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="assetBreakdown")
    total_investments: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="totalInvestments")
    investment_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="investmentBreakdown")

    # Liabilities & Debts
    total_debt: Decimal = Field(default=Decimal("0.0000"), ge=0, alias="totalDebt")
    debt_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="debtBreakdown")

    # Risk Profile
    risk_profile: str = Field(default="Moderate", alias="riskProfile", max_length=50)
    risk_score: int = Field(default=50, ge=0, le=100, alias="riskScore")

    # Onboarding Goals
    goals: Optional[List[GoalCreateOnboarding]] = Field(default=None)
    onboarding_completed: bool = Field(default=True, alias="onboardingCompleted")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class FinancialProfileUpdate(BaseModel):
    """Payload for partial updates to financial profile (e.g. from Settings)."""
    currency: Optional[str] = Field(default=None, max_length=10)
    employment_status: Optional[str] = Field(default=None, alias="employmentStatus", max_length=100)
    monthly_income: Optional[Decimal] = Field(default=None, ge=0, alias="monthlyIncome")
    additional_income: Optional[Decimal] = Field(default=None, ge=0, alias="additionalIncome")
    income_sources: Optional[Dict[str, Any]] = Field(default=None, alias="incomeSources")
    monthly_expenses: Optional[Decimal] = Field(default=None, ge=0, alias="monthlyExpenses")
    expense_categories: Optional[Dict[str, Any]] = Field(default=None, alias="expenseCategories")
    savings: Optional[Decimal] = Field(default=None, ge=0)
    cash_balance: Optional[Decimal] = Field(default=None, ge=0, alias="cashBalance")
    emergency_fund: Optional[Decimal] = Field(default=None, ge=0, alias="emergencyFund")
    total_assets: Optional[Decimal] = Field(default=None, ge=0, alias="totalAssets")
    asset_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="assetBreakdown")
    total_investments: Optional[Decimal] = Field(default=None, ge=0, alias="totalInvestments")
    investment_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="investmentBreakdown")
    total_debt: Optional[Decimal] = Field(default=None, ge=0, alias="totalDebt")
    debt_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="debtBreakdown")
    risk_profile: Optional[str] = Field(default=None, alias="riskProfile", max_length=50)
    risk_score: Optional[int] = Field(default=None, ge=0, le=100, alias="riskScore")
    onboarding_completed: Optional[bool] = Field(default=None, alias="onboardingCompleted")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class FinancialProfileRead(BaseModel):
    """Standardized response schema for user financial profile."""
    id: str
    user_id: str = Field(..., alias="userId")
    currency: str
    employment_status: Optional[str] = Field(default=None, alias="employmentStatus")
    
    monthly_income: Decimal = Field(..., alias="monthlyIncome")
    additional_income: Decimal = Field(..., alias="additionalIncome")
    total_monthly_income: Decimal = Field(..., alias="totalMonthlyIncome")
    income_sources: Optional[Dict[str, Any]] = Field(default=None, alias="incomeSources")

    monthly_expenses: Decimal = Field(..., alias="monthlyExpenses")
    expense_categories: Optional[Dict[str, Any]] = Field(default=None, alias="expenseCategories")

    savings: Decimal
    savings_rate: float = Field(default=0.0, alias="savingsRate")

    cash_balance: Decimal = Field(..., alias="cashBalance")
    emergency_fund: Decimal = Field(..., alias="emergencyFund")
    liquid_savings: Decimal = Field(..., alias="liquidSavings")

    total_assets: Decimal = Field(..., alias="totalAssets")
    asset_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="assetBreakdown")
    total_investments: Decimal = Field(..., alias="totalInvestments")
    investment_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="investmentBreakdown")

    total_debt: Decimal = Field(..., alias="totalDebt")
    debt_breakdown: Optional[Dict[str, Any]] = Field(default=None, alias="debtBreakdown")

    net_worth: Decimal = Field(..., alias="netWorth")
    risk_profile: str = Field(..., alias="riskProfile")
    risk_score: int = Field(..., alias="riskScore")
    onboarding_completed: bool = Field(..., alias="onboardingCompleted")

    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True, from_attributes=True)


class FinancialProfileStatus(BaseModel):
    """Onboarding completion status response."""
    onboarding_completed: bool = Field(..., alias="onboardingCompleted")
    has_profile: bool = Field(..., alias="hasProfile")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
