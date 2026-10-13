"""Dedicated PostgreSQL precision and constraints validation tests."""

from datetime import datetime, timezone
from decimal import Decimal
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal
from app.models.investment import InvestmentPortfolio, InvestmentPosition
from app.models.settings import UserSettings
from app.models.transaction import Transaction
from app.models.user import User


@pytest.mark.asyncio
async def test_monetary_exact_precision_values(db_session: AsyncSession):
    """
    Explicitly test required precision values:
    0.10, 0.20, 123456789.1234, fractional shares 0.000001,
    and verify zero floating-point distortion.
    """
    user = User(email="precision.test@example.com", name="Precision Tester", password_hash="test_pw_hash")
    db_session.add(user)
    await db_session.commit()

    val1 = Decimal("0.1000")
    val2 = Decimal("0.2000")
    large_val = Decimal("123456789.1234")

    tx1 = Transaction(
        user_id=user.id,
        title="Small Credit 1",
        category="Test",
        amount=val1,
        type="credit",
        date=datetime.now(timezone.utc),
    )
    tx2 = Transaction(
        user_id=user.id,
        title="Small Credit 2",
        category="Test",
        amount=val2,
        type="credit",
        date=datetime.now(timezone.utc),
    )
    tx3 = Transaction(
        user_id=user.id,
        title="Large Wealth Transfer",
        category="Transfer",
        amount=large_val,
        type="credit",
        date=datetime.now(timezone.utc),
    )
    db_session.add_all([tx1, tx2, tx3])
    await db_session.commit()

    # Query back and test exact arithmetic
    stmt = select(Transaction).where(Transaction.user_id == user.id)
    result = await db_session.execute(stmt)
    txs = result.scalars().all()

    tx_map = {t.title: t for t in txs}
    assert tx_map["Small Credit 1"].amount == Decimal("0.1000")
    assert tx_map["Small Credit 2"].amount == Decimal("0.2000")
    assert tx_map["Large Wealth Transfer"].amount == Decimal("123456789.1234")

    # In floating point: 0.1 + 0.2 == 0.30000000000000004 != 0.3
    # With exact Decimal in PostgreSQL Numeric:
    sum_small = tx_map["Small Credit 1"].amount + tx_map["Small Credit 2"].amount
    assert sum_small == Decimal("0.3000")


@pytest.mark.asyncio
async def test_fractional_shares_and_sub_cent_prices(db_session: AsyncSession):
    """Test 6-decimal fractional shares and sub-cent pricing in investment positions."""
    user = User(email="fractional@example.com", name="Fractional Investor", password_hash="test_pw_hash")
    db_session.add(user)
    await db_session.commit()

    portfolio = InvestmentPortfolio(user_id=user.id, name="Crypto & Micro Equities")
    db_session.add(portfolio)
    await db_session.commit()

    micro_shares = Decimal("0.000125")
    unit_price = Decimal("65432.1234")

    position = InvestmentPosition(
        portfolio_id=portfolio.id,
        ticker="BTC",
        name="Bitcoin",
        shares=micro_shares,
        avg_price=unit_price,
        current_price=Decimal("70000.0000"),
        asset_class="Commodity",
    )
    db_session.add(position)
    await db_session.commit()
    await db_session.refresh(position)

    assert position.shares == micro_shares
    assert position.avg_price == unit_price
    assert position.current_price == Decimal("70000.0000")

    expected_value = micro_shares * Decimal("70000.0000")
    assert position.total_value == expected_value


@pytest.mark.asyncio
async def test_user_settings_unique_constraint(db_session: AsyncSession):
    """Verify that a user can have at most one UserSettings record (1-to-1 uniqueness)."""
    user = User(email="settings.user@example.com", name="Settings User", password_hash="test_pw_hash")
    db_session.add(user)
    await db_session.commit()

    s1 = UserSettings(user_id=user.id, currency="INR", theme="dark")
    db_session.add(s1)
    await db_session.commit()

    # Second settings record for same user must fail with IntegrityError
    s2 = UserSettings(user_id=user.id, currency="USD", theme="light")
    db_session.add(s2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()
