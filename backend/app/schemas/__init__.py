"""Pydantic schemas package."""

from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, TokenResponse
from app.schemas.common import ApiErrorDetail, ApiResponse, PaginatedResponse, PlaceholderResponse
from app.schemas.financial_profile import (
    FinancialProfileCreate,
    FinancialProfileRead,
    FinancialProfileStatus,
    FinancialProfileUpdate,
    GoalCreateOnboarding,
)
from app.schemas.goal import GoalBase, GoalCreate, GoalRead, GoalUpdate
from app.schemas.health import HealthStatus
from app.schemas.investment import (
    InvestmentPortfolioBase,
    InvestmentPortfolioCreate,
    InvestmentPortfolioRead,
    InvestmentPositionBase,
    InvestmentPositionCreate,
    InvestmentPositionRead,
    InvestmentPositionUpdate,
    PortfolioSummaryRead,
)
from app.schemas.notification import (
    NotificationBase,
    NotificationCreate,
    NotificationRead,
    NotificationUpdate,
)
from app.schemas.report import FinancialReportBase, FinancialReportCreate, FinancialReportRead
from app.schemas.settings import (
    UserPreferencesBase,
    UserPreferencesRead,
    UserPreferencesUpdate,
    UserProfileBase,
    UserProfileRead,
    UserProfileUpdate,
    UserSettingsRead,
    UserSettingsUpdate,
)
from app.schemas.transaction import (
    TransactionBase,
    TransactionCreate,
    TransactionRead,
    TransactionUpdate,
)
from app.schemas.user import UserBase, UserCreate, UserRead, UserUpdate

__all__ = [
    "ApiResponse",
    "ApiErrorDetail",
    "PaginatedResponse",
    "PlaceholderResponse",
    "HealthStatus",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserRead",
    "TransactionBase",
    "TransactionCreate",
    "TransactionUpdate",
    "TransactionRead",
    "GoalBase",
    "GoalCreate",
    "GoalUpdate",
    "GoalRead",
    "NotificationBase",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationRead",
    "UserProfileBase",
    "UserProfileUpdate",
    "UserProfileRead",
    "UserPreferencesBase",
    "UserPreferencesUpdate",
    "UserPreferencesRead",
    "UserSettingsRead",
    "UserSettingsUpdate",
    "InvestmentPositionBase",
    "InvestmentPositionCreate",
    "InvestmentPositionUpdate",
    "InvestmentPositionRead",
    "InvestmentPortfolioBase",
    "InvestmentPortfolioCreate",
    "InvestmentPortfolioRead",
    "PortfolioSummaryRead",
    "FinancialReportBase",
    "FinancialReportCreate",
    "FinancialReportRead",
    "FinancialProfileCreate",
    "FinancialProfileUpdate",
    "FinancialProfileRead",
    "FinancialProfileStatus",
    "GoalCreateOnboarding",
]
