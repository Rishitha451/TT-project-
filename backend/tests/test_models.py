"""Tests for SQLAlchemy models, constraints, monetary precision, and relationships."""

from datetime import datetime, timezone
from decimal import Decimal
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal
from app.models.investment import InvestmentPortfolio, InvestmentPosition
from app.models.notification import Notification
from app.models.report import FinancialReport
from app.models.settings import UserSettings
from app.models.transaction import Transaction
from app.models.user import User


@pytest.mark.asyncio
async def test_user_creation_and_uniqueness(db_session: AsyncSession):
    """Test user creation and email uniqueness constraint."""
    user1 = User(
        email="alex.morgan@example.com",
        name="Alex Morgan",
        currency="INR",
        password_hash="hashed_pw_1",
    )
    db_session.add(user1)
    await db_session.commit()

    assert user1.id is not None
    assert user1.email == "alex.morgan@example.com"
    assert user1.is_active is True
    assert user1.created_at is not None

    # Duplicate email should violate unique constraint
    user2 = User(
        email="alex.morgan@example.com",
        name="Alex Duplicate",
        password_hash="hashed_pw_2",
    )
    db_session.add(user2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_transaction_monetary_precision(db_session: AsyncSession):
    """Test that monetary values preserve exact Decimal precision without float distortion."""
    user = User(email="precision.user@example.com", name="Precision User", password_hash="test_pw_hash")
    db_session.add(user)
    await db_session.commit()

    exact_amount = Decimal("12345.6789")
    tx = Transaction(
        user_id=user.id,
        title="Consulting Income",
        category="Income",
        amount=exact_amount,
        type="credit",
        date=datetime.now(timezone.utc),
    )
    db_session.add(tx)
    await db_session.commit()
    await db_session.refresh(tx)

    assert tx.amount == exact_amount
    assert isinstance(tx.amount, Decimal)


@pytest.mark.asyncio
async def test_investment_position_computations(db_session: AsyncSession):
    """Test investment position calculations (total value, pnl, pnl_pct)."""
    user = User(email="investor@example.com", name="Investor", password_hash="test_pw_hash")
    db_session.add(user)
    await db_session.commit()

    portfolio = InvestmentPortfolio(
        user_id=user.id,
        name="Growth Portfolio",
        account_type="taxable",
    )
    db_session.add(portfolio)
    await db_session.commit()

    shares = Decimal("10.500000")
    avg_price = Decimal("100.0000")
    current_price = Decimal("120.0000")

    position = InvestmentPosition(
        portfolio_id=portfolio.id,
        ticker="AAPL",
        name="Apple Inc.",
        shares=shares,
        avg_price=avg_price,
        current_price=current_price,
        asset_class="Equity",
    )
    db_session.add(position)
    await db_session.commit()
    await db_session.refresh(position)

    expected_total_value = Decimal("1260.00000000")  # 10.5 * 120
    expected_invested = Decimal("1050.00000000")     # 10.5 * 100
    expected_pnl = Decimal("210.00000000")           # 1260 - 1050
    expected_pnl_pct = Decimal("20")                 # (210 / 1050) * 100

    assert position.total_value == expected_total_value
    assert position.total_invested == expected_invested
    assert position.pnl == expected_pnl
    assert position.pnl_pct == expected_pnl_pct


@pytest.mark.asyncio
async def test_cascading_delete_removes_child_records(db_session: AsyncSession):
    """Test that deleting a User cascades to all owned entities."""
    user = User(email="cascade@example.com", name="Cascade User", password_hash="test_pw_hash")
    db_session.add(user)
    await db_session.commit()

    tx = Transaction(
        user_id=user.id,
        title="Grocery",
        category="Food",
        amount=Decimal("50.0000"),
        type="debit",
        date=datetime.now(timezone.utc),
    )
    goal = Goal(
        user_id=user.id,
        name="Emergency Fund",
        target_amount=Decimal("10000.0000"),
        current_amount=Decimal("2500.0000"),
    )
    notif = Notification(
        user_id=user.id,
        title="Alert",
        message="Test alert",
        type="alert",
    )
    settings = UserSettings(
        user_id=user.id,
        currency="USD",
        theme="dark",
    )
    portfolio = InvestmentPortfolio(
        user_id=user.id,
        name="Retirement",
    )
    report = FinancialReport(
        user_id=user.id,
        name="Monthly Summary",
        period="March 2026",
        report_type="summary",
    )

    db_session.add_all([tx, goal, notif, settings, portfolio, report])
    await db_session.commit()

    # Add position to portfolio
    pos = InvestmentPosition(
        portfolio_id=portfolio.id,
        ticker="VTI",
        name="Vanguard Total Stock",
        shares=Decimal("5.000000"),
        avg_price=Decimal("200.0000"),
        current_price=Decimal("210.0000"),
    )
    db_session.add(pos)
    await db_session.commit()

    # Now delete the user
    await db_session.delete(user)
    await db_session.commit()

    # Verify all child records are deleted
    tx_check = await db_session.execute(select(Transaction).where(Transaction.user_id == user.id))
    assert tx_check.scalars().first() is None

    goal_check = await db_session.execute(select(Goal).where(Goal.user_id == user.id))
    assert goal_check.scalars().first() is None

    notif_check = await db_session.execute(select(Notification).where(Notification.user_id == user.id))
    assert notif_check.scalars().first() is None

    settings_check = await db_session.execute(select(UserSettings).where(UserSettings.user_id == user.id))
    assert settings_check.scalars().first() is None

    portfolio_check = await db_session.execute(select(InvestmentPortfolio).where(InvestmentPortfolio.user_id == user.id))
    assert portfolio_check.scalars().first() is None

    pos_check = await db_session.execute(select(InvestmentPosition).where(InvestmentPosition.portfolio_id == portfolio.id))
    assert pos_check.scalars().first() is None

    report_check = await db_session.execute(select(FinancialReport).where(FinancialReport.user_id == user.id))
    assert report_check.scalars().first() is None
