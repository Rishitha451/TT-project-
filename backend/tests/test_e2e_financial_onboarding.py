"""End-to-End test for Financial Onboarding lifecycle, multi-module persistence, and cross-user isolation."""

from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_e2e_full_onboarding_and_cross_module_intelligence(client: TestClient, db_session: AsyncSession):
    """
    Execute full End-to-End workflow:
    1. Register new user
    2. Authenticate & obtain JWT
    3. Check initial empty state on Dashboard & Status
    4. Submit Financial Onboarding payload (Income, Expenses, Savings, Cash, Investments, Debt, Risk, Goals)
    5. Verify Dashboard reflects baseline figures without transactions
    6. Verify Analytics reflects baseline figures
    7. Verify Goals module contains newly created onboarding goal
    8. Verify AI Advisor uses financial profile context for "Am I saving enough?"
    9. Relogin and verify persistence
    10. Register User B and verify strict cross-user isolation
    """

    # 1. Register User A
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Alex Onboarding",
            "email": "alex.onboarding@example.com",
            "password": "Password123!",
        },
    )
    assert reg_res.status_code == 201

    login_a_res = client.post(
        "/api/v1/auth/login",
        json={"email": "alex.onboarding@example.com", "password": "Password123!"},
    )
    assert login_a_res.status_code == 200
    user_a_token = login_a_res.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {user_a_token}"}

    # 2. Check initial status -> incomplete
    status_res = client.get("/api/v1/financial-profile/status", headers=headers_a)
    assert status_res.status_code == 200
    assert status_res.json()["data"]["onboardingCompleted"] is False
    assert status_res.json()["data"]["hasProfile"] is False

    # 3. Check initial Dashboard empty state
    d_initial = client.get("/api/v1/dashboard", headers=headers_a).json()["data"]
    assert Decimal(str(d_initial["monthlyIncome"])) == Decimal("0")
    assert Decimal(str(d_initial["monthlyExpenses"])) == Decimal("0")
    assert Decimal(str(d_initial["savings"])) == Decimal("0")
    assert d_initial["summary"]["savingsRate"] == 0.0

    # 4. Submit Multi-step Onboarding Financial Profile
    onboarding_payload = {
        "currency": "INR",
        "employmentStatus": "Employed",
        "monthlyIncome": 80000.0,
        "additionalIncome": 0.0,
        "incomeSources": {"Salary": 80000.0},
        "monthlyExpenses": 45000.0,
        "expenseCategories": {
            "Housing / Rent": 20000.0,
            "Food & Groceries": 15000.0,
            "Utilities": 10000.0,
        },
        "savings": 35000.0,
        "cashBalance": 200000.0,
        "emergencyFund": 150000.0,
        "totalAssets": 500000.0,
        "totalInvestments": 350000.0,
        "totalDebt": 100000.0,
        "riskProfile": "Moderate",
        "riskScore": 55,
        "goals": [
            {
                "name": "Emergency Fund",
                "targetAmount": 300000.0,
                "currentAmount": 150000.0,
                "color": "#3B82F6",
                "category": "Emergency",
            }
        ],
        "onboardingCompleted": True,
    }

    save_res = client.post("/api/v1/financial-profile", json=onboarding_payload, headers=headers_a)
    assert save_res.status_code == 200
    saved_profile = save_res.json()["data"]
    assert Decimal(str(saved_profile["monthlyIncome"])) == Decimal("80000")
    assert Decimal(str(saved_profile["monthlyExpenses"])) == Decimal("45000")
    assert Decimal(str(saved_profile["savings"])) == Decimal("35000")
    assert Decimal(str(saved_profile["cashBalance"])) == Decimal("200000")
    assert Decimal(str(saved_profile["totalInvestments"])) == Decimal("350000")
    assert Decimal(str(saved_profile["totalDebt"])) == Decimal("100000")
    assert saved_profile["onboardingCompleted"] is True

    # 5. Verify Dashboard integration
    d_after = client.get("/api/v1/dashboard", headers=headers_a).json()["data"]
    assert Decimal(str(d_after["monthlyIncome"])) == Decimal("80000")
    assert Decimal(str(d_after["monthlyExpenses"])) == Decimal("45000")
    assert Decimal(str(d_after["savings"])) == Decimal("35000")
    assert d_after["summary"]["savingsRate"] == round((35000 / 80000) * 100, 1)  # 43.8%
    assert len(d_after["spending"]) == 3

    # 6. Verify Analytics integration
    analytics_res = client.get("/api/v1/analytics", headers=headers_a).json()["data"]
    assert Decimal(str(analytics_res["totalIncome"])) == Decimal("80000")
    assert Decimal(str(analytics_res["totalExpenses"])) == Decimal("45000")
    assert Decimal(str(analytics_res["netSavings"])) == Decimal("35000")
    assert len(analytics_res["monthlyTrends"]) == 1

    # 7. Verify Goals integration
    goals_res = client.get("/api/v1/goals", headers=headers_a).json()["data"]
    assert len(goals_res) == 1
    assert goals_res[0]["name"] == "Emergency Fund"
    assert Decimal(str(goals_res[0]["target"])) == Decimal("300000")

    # 8. Verify AI Advisor integration
    chat_res = client.post(
        "/api/v1/advisor/chat",
        json={"message": "Am I saving enough?"},
        headers=headers_a,
    )
    assert chat_res.status_code == 200
    chat_content = chat_res.json()["data"]["content"]
    assert "35,000" in chat_content or "43.8%" in chat_content

    # 9. Test Re-login and Data Persistence
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "alex.onboarding@example.com", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    relogin_token = login_res.json()["data"]["access_token"]
    headers_relogin = {"Authorization": f"Bearer {relogin_token}"}

    relogin_status = client.get("/api/v1/financial-profile/status", headers=headers_relogin).json()["data"]
    assert relogin_status["onboardingCompleted"] is True

    relogin_profile = client.get("/api/v1/financial-profile", headers=headers_relogin).json()["data"]
    assert Decimal(str(relogin_profile["monthlyIncome"])) == Decimal("80000")

    # 10. Cross-User Isolation with User B
    reg_b_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Bella Newbie",
            "email": "bella.newbie@example.com",
            "password": "Password123!",
        },
    )
    assert reg_b_res.status_code == 201

    login_b_res = client.post(
        "/api/v1/auth/login",
        json={"email": "bella.newbie@example.com", "password": "Password123!"},
    )
    assert login_b_res.status_code == 200
    user_b_token = login_b_res.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User B status must be incomplete
    b_status = client.get("/api/v1/financial-profile/status", headers=headers_b).json()["data"]
    assert b_status["onboardingCompleted"] is False
    assert b_status["hasProfile"] is False

    # User B dashboard must show 0s
    b_dashboard = client.get("/api/v1/dashboard", headers=headers_b).json()["data"]
    assert Decimal(str(b_dashboard["monthlyIncome"])) == Decimal("0")
    assert Decimal(str(b_dashboard["savings"])) == Decimal("0")
    assert len(b_dashboard["spending"]) == 0

    # User B goals must be empty
    b_goals = client.get("/api/v1/goals", headers=headers_b).json()["data"]
    assert len(b_goals) == 0
