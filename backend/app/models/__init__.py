"""
Data models package.
Imports all models so SQLAlchemy metadata is fully populated for Alembic migrations.
"""

from app.models.financial_profile import FinancialProfile
from app.models.goal import Goal
from app.models.investment import InvestmentPortfolio, InvestmentPosition
from app.models.notification import Notification
from app.models.report import FinancialReport
from app.models.settings import UserSettings
from app.models.transaction import Transaction
from app.models.user import User

__all__ = [
    "User",
    "Transaction",
    "Goal",
    "Notification",
    "UserSettings",
    "InvestmentPortfolio",
    "InvestmentPosition",
    "FinancialReport",
    "FinancialProfile",
]
