"""Comprehensive test suite for Financial Profile, Onboarding baseline, and module integrations."""

from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_profile import FinancialProfile
from app.models.goal import Goal
from app.models.user import User
from app.services.financial_profile_service import FinancialProfileService


@pytest.fixture
async def authenticated_user_a(db_session: AsyncSession):
    """Create test user A and return user model and auth headers."""
    from app.core.security import hash_password, create_access_token

    user = User(
        email="user_a@example.com",
        name="User Alpha",
        password_hash=hash_password("Secret123!"),
        currency="INR",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers


@pytest.fixture
async def authenticated_user_b(db_session: AsyncSession):
    """Create test user B for cross-user isolation validation."""
    from app.core.security import hash_password, create_access_token

    user = User(
        email="user_b@example.com",
        name="User Beta",
        password_hash=hash_password("Secret123!"),
        currency="INR",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers


@pytest.mark.asyncio
async def test_get_status_incomplete(client: TestClient, authenticated_user_a):
    """Verify newly registered user starts with incomplete onboarding status."""
    user, headers = authenticated_user_a
    response = client.get("/api/v1/financial-profile/status", headers=headers)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["onboardingCompleted"] is False
    assert json_data["data"]["hasProfile"] is False


@pytest.mark.asyncio
async def test_create_financial_profile_full_onboarding(client: TestClient, authenticated_user_a):
    """Test full multi-step onboarding payload submission and persistence."""
    user, headers = authenticated_user_a

    payload = {
        "currency": "INR",
        "employmentStatus": "Employed",
        "monthlyIncome": 80000.0,
        "additionalIncome": 10000.0,
        "incomeSources": {"Salary": 80000.0, "Freelance": 10000.0},
        "monthlyExpenses": 45000.0,
        "expenseCategories": {
            "Housing / Rent": 20000.0,
            "Food & Groceries": 10000.0,
            "Transportation": 5000.0,
            "Utilities": 5000.0,
            "Entertainment": 5000.0,
        },
        "savings": 45000.0,
        "cashBalance": 100000.0,
        "emergencyFund": 100000.0,
        "totalAssets": 500000.0,
        "assetBreakdown": {"Property": 400000.0, "Gold": 100000.0},
        "totalInvestments": 350000.0,
        "investmentBreakdown": {
            "Mutual Funds": {"value": 200000.0, "cost_basis": 180000.0},
            "Stocks": {"value": 150000.0, "cost_basis": 130000.0},
        },
        "totalDebt": 100000.0,
        "debtBreakdown": {
            "Car Loan": {"balance": 100000.0, "monthly_payment": 8000.0, "interest_rate": 8.5}
        },
        "riskProfile": "Moderate",
        "riskScore": 55,
        "goals": [
            {
                "name": "Emergency Fund",
                "targetAmount": 300000.0,
                "currentAmount": 100000.0,
                "color": "#3B82F6",
                "category": "Emergency",
            }
        ],
        "onboardingCompleted": True,
    }

    res = client.post("/api/v1/financial-profile", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]

    assert Decimal(str(data["monthlyIncome"])) == Decimal("80000")
    assert Decimal(str(data["additionalIncome"])) == Decimal("10000")
    assert Decimal(str(data["totalMonthlyIncome"])) == Decimal("90000")
    assert Decimal(str(data["monthlyExpenses"])) == Decimal("45000")
    assert Decimal(str(data["savings"])) == Decimal("45000")
    assert Decimal(str(data["cashBalance"])) == Decimal("100000")
    assert Decimal(str(data["emergencyFund"])) == Decimal("100000")
    assert Decimal(str(data["liquidSavings"])) == Decimal("245000")  # 100k + 100k + 45k
    assert Decimal(str(data["totalAssets"])) == Decimal("500000")
    assert Decimal(str(data["totalInvestments"])) == Decimal("350000")
    assert Decimal(str(data["totalDebt"])) == Decimal("100000")
    assert data["riskProfile"] == "Moderate"
    assert data["onboardingCompleted"] is True

    # Check status endpoint now returns True
    status_res = client.get("/api/v1/financial-profile/status", headers=headers)
    assert status_res.json()["data"]["onboardingCompleted"] is True

    # Check Goal was created in goals table
    goals_res = client.get("/api/v1/goals", headers=headers)
    assert goals_res.status_code == 200
    goals_data = goals_res.json()["data"]
    assert len(goals_data) == 1
    assert goals_data[0]["name"] == "Emergency Fund"
    assert Decimal(str(goals_data[0]["target"])) == Decimal("300000")


@pytest.mark.asyncio
async def test_update_financial_profile_patch(client: TestClient, authenticated_user_a):
    """Test partial profile updates from Settings."""
    user, headers = authenticated_user_a

    # Initialize profile
    client.post(
        "/api/v1/financial-profile",
        json={"monthlyIncome": 50000.0, "monthlyExpenses": 30000.0, "onboardingCompleted": True},
        headers=headers,
    )

    # Patch income
    patch_res = client.patch(
        "/api/v1/financial-profile",
        json={"monthlyIncome": 75000.0},
        headers=headers,
    )
    assert patch_res.status_code == 200
    patched_data = patch_res.json()["data"]
    assert Decimal(str(patched_data["monthlyIncome"])) == Decimal("75000")
    assert Decimal(str(patched_data["monthlyExpenses"])) == Decimal("30000")
    assert Decimal(str(patched_data["savings"])) == Decimal("45000")  # auto-updated 75k - 30k


@pytest.mark.asyncio
async def test_cross_user_isolation(client: TestClient, authenticated_user_a, authenticated_user_b):
    """Test strict tenancy isolation: User B cannot view or modify User A's financial profile."""
    user_a, headers_a = authenticated_user_a
    user_b, headers_b = authenticated_user_b

    # User A creates profile
    client.post(
        "/api/v1/financial-profile",
        json={"monthlyIncome": 120000.0, "monthlyExpenses": 40000.0, "totalAssets": 900000.0, "onboardingCompleted": True},
        headers=headers_a,
    )

    # User B checks status & profile
    b_status = client.get("/api/v1/financial-profile/status", headers=headers_b)
    assert b_status.json()["data"]["onboardingCompleted"] is False

    b_profile = client.get("/api/v1/financial-profile", headers=headers_b)
    assert b_profile.json()["data"] is None

    # User B posts their own profile
    client.post(
        "/api/v1/financial-profile",
        json={"monthlyIncome": 35000.0, "monthlyExpenses": 20000.0, "onboardingCompleted": True},
        headers=headers_b,
    )

    # Verify User A's profile is intact
    a_profile = client.get("/api/v1/financial-profile", headers=headers_a)
    assert Decimal(str(a_profile.json()["data"]["monthlyIncome"])) == Decimal("120000")


@pytest.mark.asyncio
async def test_unauthenticated_access(client: TestClient):
    """Test unauthenticated requests are rejected with 401 Unauthorized."""
    res_get = client.get("/api/v1/financial-profile")
    assert res_get.status_code == 401

    res_post = client.post("/api/v1/financial-profile", json={"monthlyIncome": 50000.0})
    assert res_post.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_uses_financial_profile_baseline(client: TestClient, authenticated_user_a):
    """Test that dashboard reflects profile baseline numbers when no transactions exist."""
    user, headers = authenticated_user_a

    # Before profile setup -> 0s
    d_before = client.get("/api/v1/dashboard", headers=headers).json()["data"]
    assert Decimal(str(d_before["monthlyIncome"])) == Decimal("0")
    assert Decimal(str(d_before["monthlyExpenses"])) == Decimal("0")
    assert Decimal(str(d_before["savings"])) == Decimal("0")
    assert d_before["summary"]["savingsRate"] == 0.0

    # Save profile baseline
    client.post(
        "/api/v1/financial-profile",
        json={
            "monthlyIncome": 80000.0,
            "additionalIncome": 10000.0,
            "monthlyExpenses": 45000.0,
            "savings": 45000.0,
            "cashBalance": 100000.0,
            "totalAssets": 500000.0,
            "totalInvestments": 350000.0,
            "totalDebt": 100000.0,
            "expenseCategories": {"Housing / Rent": 25000.0, "Groceries": 20000.0},
            "onboardingCompleted": True,
        },
        headers=headers,
    )

    # After profile setup -> reflects baseline
    d_after = client.get("/api/v1/dashboard", headers=headers).json()["data"]
    assert Decimal(str(d_after["monthlyIncome"])) == Decimal("90000")
    assert Decimal(str(d_after["monthlyExpenses"])) == Decimal("45000")
    assert Decimal(str(d_after["savings"])) == Decimal("45000")
    assert d_after["summary"]["savingsRate"] == 50.0  # 45k / 90k
    assert len(d_after["spending"]) == 2


@pytest.mark.asyncio
async def test_ai_advisor_uses_financial_profile_context(client: TestClient, authenticated_user_a):
    """Test AI Advisor answers questions using financial profile context."""
    user, headers = authenticated_user_a

    # Setup profile
    client.post(
        "/api/v1/financial-profile",
        json={
            "monthlyIncome": 80000.0,
            "monthlyExpenses": 45000.0,
            "savings": 35000.0,
            "emergencyFund": 150000.0,
            "totalDebt": 120000.0,
            "riskProfile": "Moderate",
            "onboardingCompleted": True,
        },
        headers=headers,
    )

    # Ask about debt
    debt_res = client.post("/api/v1/advisor/chat", json={"message": "How much debt do I have?"}, headers=headers)
    assert debt_res.status_code == 200
    debt_content = debt_res.json()["data"]["content"]
    assert "120,000" in debt_content

    # Ask about savings
    savings_res = client.post("/api/v1/advisor/chat", json={"message": "Am I saving enough?"}, headers=headers)
    assert savings_res.status_code == 200
    savings_content = savings_res.json()["data"]["content"]
    assert "35,000" in savings_content

    # Ask about emergency fund
    efund_res = client.post("/api/v1/advisor/chat", json={"message": "How much emergency savings do I have?"}, headers=headers)
    assert efund_res.status_code == 200
    efund_content = efund_res.json()["data"]["content"]
    assert "150,000" in efund_content
