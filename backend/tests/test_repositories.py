"""Tests for repository persistence operations."""

from datetime import datetime, timezone
from decimal import Decimal
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal
from app.models.investment import InvestmentPortfolio, InvestmentPosition
from app.models.notification import Notification
from app.models.report import FinancialReport
from app.models.settings import UserSettings
from app.models.transaction import Transaction
from app.models.user import User
from app.repositories.goal_repository import GoalRepository
from app.repositories.investment_repository import InvestmentRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.report_repository import FinancialReportRepository
from app.repositories.settings_repository import SettingsRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.user_repository import UserRepository


@pytest.mark.asyncio
async def test_user_repository_crud(db_session: AsyncSession):
    """Test UserRepository operations."""
    repo = UserRepository(db_session)

    user = User(email="repo.user@example.com", name="Repo User", password_hash="test_pw_hash")
    created = await repo.create(user)
    assert created.id is not None

    found = await repo.get_by_email("repo.user@example.com")
    assert found is not None
    assert found.id == created.id

    found.name = "Repo User Updated"
    updated = await repo.update(found)
    assert updated.name == "Repo User Updated"


@pytest.mark.asyncio
async def test_transaction_repository_filtering(db_session: AsyncSession):
    """Test TransactionRepository user and category filtering."""
    user_repo = UserRepository(db_session)
    user = await user_repo.create(User(email="tx.repo@example.com", name="Tx User", password_hash="test_pw_hash"))

    tx_repo = TransactionRepository(db_session)
    now = datetime.now(timezone.utc)

    tx1 = Transaction(
        user_id=user.id,
        title="Dinner",
        category="Dining",
        amount=Decimal("45.5000"),
        type="debit",
        date=now,
    )
    tx2 = Transaction(
        user_id=user.id,
        title="Salary",
        category="Income",
        amount=Decimal("5000.0000"),
        type="credit",
        date=now,
    )
    await tx_repo.create(tx1)
    await tx_repo.create(tx2)

    user_txs = await tx_repo.get_by_user(user.id)
    assert len(user_txs) == 2

    dining_txs = await tx_repo.get_by_user(user.id, category="Dining")
    assert len(dining_txs) == 1
    assert dining_txs[0].title == "Dinner"


@pytest.mark.asyncio
async def test_notification_repository_unread_and_mark_all(db_session: AsyncSession):
    """Test NotificationRepository unread querying and mark_all_as_read."""
    user_repo = UserRepository(db_session)
    user = await user_repo.create(User(email="notif.repo@example.com", name="Notif User", password_hash="test_pw_hash"))

    notif_repo = NotificationRepository(db_session)
    n1 = Notification(user_id=user.id, title="Alert 1", message="Msg 1", is_read=False)
    n2 = Notification(user_id=user.id, title="Alert 2", message="Msg 2", is_read=False)
    n3 = Notification(user_id=user.id, title="Alert 3", message="Msg 3", is_read=True)

    await notif_repo.create(n1)
    await notif_repo.create(n2)
    await notif_repo.create(n3)

    unread = await notif_repo.get_by_user(user.id, unread_only=True)
    assert len(unread) == 2

    updated_count = await notif_repo.mark_all_as_read(user.id)
    assert updated_count == 2

    unread_after = await notif_repo.get_by_user(user.id, unread_only=True)
    assert len(unread_after) == 0


@pytest.mark.asyncio
async def test_investment_repository_with_positions(db_session: AsyncSession):
    """Test InvestmentRepository portfolio and positions persistence."""
    user_repo = UserRepository(db_session)
    user = await user_repo.create(User(email="invest.repo@example.com", name="Invest User", password_hash="test_pw_hash"))

    user_id = user.id
    invest_repo = InvestmentRepository(db_session)
    portfolio = await invest_repo.create_portfolio(
        InvestmentPortfolio(user_id=user_id, name="Core Holdings")
    )

    pos1 = await invest_repo.create_position(
        InvestmentPosition(
            portfolio_id=portfolio.id,
            ticker="NVDA",
            name="Nvidia Corp",
            shares=Decimal("15.000000"),
            avg_price=Decimal("110.0000"),
            current_price=Decimal("130.0000"),
        )
    )

    db_session.expire_all()
    portfolios = await invest_repo.get_portfolios_by_user(user_id)
    assert len(portfolios) == 1
    assert len(portfolios[0].positions) == 1
    assert portfolios[0].positions[0].ticker == "NVDA"
