"""Comprehensive tests for Phase 7E Investment APIs:
Portfolios, Positions, Summary, Market, Risk, and Insights.
Includes cross-user isolation, mathematical precision tests, and empty state validation.
"""

from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession


def register_and_get_token(client: TestClient, email: str, name: str, password: str = "SecurePass123!") -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": name, "password": password},
    )
    assert res.status_code == 201, res.text
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200, login_res.text
    return login_res.json()["data"]["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# 1. PORTFOLIOS CRUD & OWNERSHIP TESTS
# ---------------------------------------------------------------------------

def test_portfolio_crud_and_validation(client: TestClient, db_session: AsyncSession):
    token = register_and_get_token(client, "portfolio_user@example.com", "Portfolio User")
    headers = auth_headers(token)

    # 1. Create Portfolio
    create_payload = {
        "name": "Tech Growth Portfolio",
        "accountType": "taxable",
        "brokerageName": "Zerodha",
    }
    create_res = client.post("/api/v1/investments/portfolios", json=create_payload, headers=headers)
    assert create_res.status_code == 200, create_res.text
    port_data = create_res.json()["data"]
    port_id = port_data["id"]

    assert port_data["name"] == "Tech Growth Portfolio"
    assert port_data["accountType"] == "taxable"
    assert port_data["brokerageName"] == "Zerodha"
    assert Decimal(str(port_data["totalValue"])) == Decimal("0.0000")

    # 2. Get Single Portfolio
    get_res = client.get(f"/api/v1/investments/portfolios/{port_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == port_id

    # 3. List Portfolios
    list_res = client.get("/api/v1/investments/portfolios", headers=headers)
    assert list_res.status_code == 200
    ports = list_res.json()["data"]
    assert len(ports) == 1
    assert ports[0]["id"] == port_id

    # 4. Patch Portfolio
    patch_res = client.patch(
        f"/api/v1/investments/portfolios/{port_id}",
        json={"name": "Updated Tech Growth", "brokerageName": "Upstox"},
        headers=headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["name"] == "Updated Tech Growth"
    assert patch_res.json()["data"]["brokerageName"] == "Upstox"

    # 5. Delete Portfolio
    del_res = client.delete(f"/api/v1/investments/portfolios/{port_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["deleted"] is True

    # Confirm 404
    get_after = client.get(f"/api/v1/investments/portfolios/{port_id}", headers=headers)
    assert get_after.status_code == 404


def test_portfolio_cross_user_isolation(client: TestClient, db_session: AsyncSession):
    token_a = register_and_get_token(client, "port_owner_a@example.com", "Owner A")
    token_b = register_and_get_token(client, "port_attacker_b@example.com", "Attacker B")

    # User A creates portfolio
    res_a = client.post(
        "/api/v1/investments/portfolios",
        json={"name": "Secret Portfolio A", "accountType": "retirement"},
        headers=auth_headers(token_a),
    )
    port_id = res_a.json()["data"]["id"]

    # User B attempts GET -> 404
    b_get = client.get(f"/api/v1/investments/portfolios/{port_id}", headers=auth_headers(token_b))
    assert b_get.status_code == 404

    # User B attempts PATCH -> 404
    b_patch = client.patch(
        f"/api/v1/investments/portfolios/{port_id}",
        json={"name": "Hacked"},
        headers=auth_headers(token_b),
    )
    assert b_patch.status_code == 404

    # User B attempts DELETE -> 404
    b_del = client.delete(f"/api/v1/investments/portfolios/{port_id}", headers=auth_headers(token_b))
    assert b_del.status_code == 404

    # User B list should be empty
    b_list = client.get("/api/v1/investments/portfolios", headers=auth_headers(token_b))
    assert b_list.status_code == 200
    assert b_list.json()["data"] == []


# ---------------------------------------------------------------------------
# 2. POSITIONS CRUD & CALCULATIONS TESTS
# ---------------------------------------------------------------------------

def test_position_crud_and_financial_calculations(client: TestClient, db_session: AsyncSession):
    token = register_and_get_token(client, "pos_user@example.com", "Position User")
    headers = auth_headers(token)

    # Create portfolio
    port_res = client.post(
        "/api/v1/investments/portfolios",
        json={"name": "Main Portfolio", "accountType": "taxable"},
        headers=headers,
    )
    port_id = port_res.json()["data"]["id"]

    # 1. Create Position
    create_pos_payload = {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "shares": "50.000000",
        "avgPrice": "150.0000",
        "currentPrice": "175.5000",
        "sector": "Technology",
        "assetClass": "Equity",
    }
    pos_res = client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json=create_pos_payload,
        headers=headers,
    )
    assert pos_res.status_code == 200, pos_res.text
    pos_data = pos_res.json()["data"]
    pos_id = pos_data["id"]

    assert pos_data["ticker"] == "AAPL"
    assert Decimal(str(pos_data["shares"])) == Decimal("50.000000")
    assert Decimal(str(pos_data["avgPrice"])) == Decimal("150.0000")
    assert Decimal(str(pos_data["currentPrice"])) == Decimal("175.5000")
    assert Decimal(str(pos_data["totalValue"])) == Decimal("8775.0000")
    assert Decimal(str(pos_data["pnl"])) == Decimal("1275.0000")
    assert Decimal(str(pos_data["pnlPct"])) == Decimal("17.0000")

    # 2. Reject Invalid Shares (<= 0)
    bad_res = client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json={"ticker": "AAPL", "name": "Apple", "shares": "0", "avgPrice": "150", "currentPrice": "175"},
        headers=headers,
    )
    assert bad_res.status_code == 422

    # 3. List Positions by Portfolio
    list_pos = client.get(f"/api/v1/investments/portfolios/{port_id}/positions", headers=headers)
    assert list_pos.status_code == 200
    assert len(list_pos.json()["data"]) == 1
    assert list_pos.json()["data"][0]["allocation"] == 100.0

    # 4. List All User Positions
    list_all = client.get("/api/v1/investments/positions", headers=headers)
    assert list_all.status_code == 200
    assert len(list_all.json()["data"]) == 1

    # 5. Patch Position
    patch_pos = client.patch(
        f"/api/v1/investments/positions/{pos_id}",
        json={"currentPrice": "200.0000"},
        headers=headers,
    )
    assert patch_pos.status_code == 200
    patched_data = patch_pos.json()["data"]
    assert Decimal(str(patched_data["totalValue"])) == Decimal("10000.0000")
    assert Decimal(str(patched_data["pnl"])) == Decimal("2500.0000")
    assert Decimal(str(patched_data["pnlPct"])) == Decimal("33.3333")

    # 6. Delete Position
    del_pos = client.delete(f"/api/v1/investments/positions/{pos_id}", headers=headers)
    assert del_pos.status_code == 200
    assert del_pos.json()["data"]["deleted"] is True


def test_position_cross_user_isolation(client: TestClient, db_session: AsyncSession):
    token_a = register_and_get_token(client, "pos_owner_a@example.com", "Owner Pos A")
    token_b = register_and_get_token(client, "pos_attacker_b@example.com", "Attacker Pos B")

    # User A creates portfolio & position
    port_a = client.post(
        "/api/v1/investments/portfolios",
        json={"name": "Vault A", "accountType": "taxable"},
        headers=auth_headers(token_a),
    ).json()["data"]["id"]

    pos_a = client.post(
        f"/api/v1/investments/portfolios/{port_a}/positions",
        json={"ticker": "MSFT", "name": "Microsoft", "shares": "10", "avgPrice": "300", "currentPrice": "340"},
        headers=auth_headers(token_a),
    ).json()["data"]["id"]

    # User B attempts to add position to User A's portfolio -> 404
    b_add = client.post(
        f"/api/v1/investments/portfolios/{port_a}/positions",
        json={"ticker": "GOOG", "name": "Google", "shares": "5", "avgPrice": "100", "currentPrice": "150"},
        headers=auth_headers(token_b),
    )
    assert b_add.status_code == 404

    # User B attempts to GET User A's position -> 404
    b_get = client.get(f"/api/v1/investments/positions/{pos_a}", headers=auth_headers(token_b))
    assert b_get.status_code == 404

    # User B attempts to PATCH User A's position -> 404
    b_patch = client.patch(
        f"/api/v1/investments/positions/{pos_a}",
        json={"shares": "1000"},
        headers=auth_headers(token_b),
    )
    assert b_patch.status_code == 404

    # User B attempts to DELETE User A's position -> 404
    b_del = client.delete(f"/api/v1/investments/positions/{pos_a}", headers=auth_headers(token_b))
    assert b_del.status_code == 404


# ---------------------------------------------------------------------------
# 3. PORTFOLIO SUMMARY TESTS
# ---------------------------------------------------------------------------

def test_portfolio_summary_empty_and_populated(client: TestClient, db_session: AsyncSession):
    token = register_and_get_token(client, "summary_user@example.com", "Summary User")
    headers = auth_headers(token)

    # 1. Empty State
    empty_summary = client.get("/api/v1/investments/summary", headers=headers)
    assert empty_summary.status_code == 200
    empty_data = empty_summary.json()["data"]
    assert Decimal(str(empty_data["totalValue"])) == Decimal("0")
    assert Decimal(str(empty_data["totalInvested"])) == Decimal("0")
    assert Decimal(str(empty_data["overallPnl"])) == Decimal("0")
    assert empty_data["riskLevel"] == "Moderate"

    # 2. Add Portfolio + Holdings
    port_id = client.post(
        "/api/v1/investments/portfolios",
        json={"name": "Investment Acct", "accountType": "taxable"},
        headers=headers,
    ).json()["data"]["id"]

    # Position 1: AAPL (10 * 150 = 1500 cost, 10 * 200 = 2000 val)
    client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json={"ticker": "AAPL", "name": "Apple", "shares": "10", "avgPrice": "150", "currentPrice": "200", "assetClass": "Equity"},
        headers=headers,
    )
    # Position 2: BND (20 * 100 = 2000 cost, 20 * 100 = 2000 val)
    client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json={"ticker": "BND", "name": "Bond ETF", "shares": "20", "avgPrice": "100", "currentPrice": "100", "assetClass": "Fixed Income"},
        headers=headers,
    )

    # 3. Populated Summary Check
    res = client.get("/api/v1/investments/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert Decimal(str(data["totalValue"])) == Decimal("4000.0000")
    assert Decimal(str(data["totalInvested"])) == Decimal("3500.0000")
    assert Decimal(str(data["overallPnl"])) == Decimal("500.0000")
    assert Decimal(str(data["overallPnlPct"])) == Decimal("14.2900")
    assert data["marketSentiment"] in ("Bullish", "Neutral", "Bearish")


# ---------------------------------------------------------------------------
# 4. MARKET INTELLIGENCE TESTS
# ---------------------------------------------------------------------------

def test_market_intelligence_endpoints(client: TestClient, db_session: AsyncSession):
    token = register_and_get_token(client, "market_user@example.com", "Market User")
    headers = auth_headers(token)

    # 1. Market Overview
    overview_res = client.get("/api/v1/investments/market", headers=headers)
    assert overview_res.status_code == 200
    overview_data = overview_res.json()["data"]
    assert len(overview_data["indices"]) >= 3
    assert len(overview_data["news"]) >= 3
    assert overview_data["sentiment"]["score"] == 68.5

    # 2. Indices
    idx_res = client.get("/api/v1/investments/indices", headers=headers)
    assert idx_res.status_code == 200
    assert any(i["symbol"] == "S&P 500" for i in idx_res.json()["data"])

    # 3. News
    news_res = client.get("/api/v1/investments/news", headers=headers)
    assert news_res.status_code == 200
    assert len(news_res.json()["data"]) >= 1

    # 4. Sentiment
    sent_res = client.get("/api/v1/investments/sentiment", headers=headers)
    assert sent_res.status_code == 200
    assert sent_res.json()["data"]["label"] == "Bullish"

    # 5. Asset Detail
    asset_res = client.get("/api/v1/investments/assets/AAPL", headers=headers)
    assert asset_res.status_code == 200
    asset_data = asset_res.json()["data"]
    assert asset_data["ticker"] == "AAPL"
    assert asset_data["name"] == "Apple Inc."
    assert len(asset_data["historicalReturns"]) >= 3


# ---------------------------------------------------------------------------
# 5. RISK ANALYSIS TESTS
# ---------------------------------------------------------------------------

def test_risk_analysis_empty_and_populated(client: TestClient, db_session: AsyncSession):
    token = register_and_get_token(client, "risk_user@example.com", "Risk User")
    headers = auth_headers(token)

    # 1. Empty State
    empty_risk = client.get("/api/v1/investments/risk", headers=headers)
    assert empty_risk.status_code == 200
    empty_data = empty_risk.json()["data"]
    assert empty_data["riskScore"] == 0
    assert empty_data["riskLevel"] == "Low"
    assert len(empty_data["scenarios"]) == 3

    # 2. Add Holdings
    port_id = client.post(
        "/api/v1/investments/portfolios",
        json={"name": "Risk Test Port", "accountType": "taxable"},
        headers=headers,
    ).json()["data"]["id"]

    client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json={"ticker": "NVDA", "name": "Nvidia", "shares": "20", "avgPrice": "400", "currentPrice": "500", "sector": "Semiconductors", "assetClass": "Equity"},
        headers=headers,
    )
    client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json={"ticker": "VOO", "name": "Vanguard 500", "shares": "10", "avgPrice": "400", "currentPrice": "400", "sector": "Broad Index", "assetClass": "ETF"},
        headers=headers,
    )

    # 3. Populated Risk Check
    pop_risk = client.get("/api/v1/investments/risk", headers=headers)
    assert pop_risk.status_code == 200
    pop_data = pop_risk.json()["data"]
    assert pop_data["riskScore"] > 0
    assert len(pop_data["exposure"]) == 2
    assert pop_data["exposure"][0]["sector"] == "Semiconductors"
    assert pop_data["exposure"][0]["percentage"] > 50.0


# ---------------------------------------------------------------------------
# 6. INVESTMENT INSIGHTS TESTS
# ---------------------------------------------------------------------------

def test_investment_insights_empty_and_populated(client: TestClient, db_session: AsyncSession):
    token = register_and_get_token(client, "insights_user@example.com", "Insights User")
    headers = auth_headers(token)

    # 1. Empty State
    empty_insights = client.get("/api/v1/investments/insights", headers=headers)
    assert empty_insights.status_code == 200
    assert empty_insights.json()["data"] == []

    # 2. Add Holding
    port_id = client.post(
        "/api/v1/investments/portfolios",
        json={"name": "Core Growth", "accountType": "taxable"},
        headers=headers,
    ).json()["data"]["id"]

    client.post(
        f"/api/v1/investments/portfolios/{port_id}/positions",
        json={"ticker": "AAPL", "name": "Apple Inc.", "shares": "50", "avgPrice": "150", "currentPrice": "180", "sector": "Technology", "assetClass": "Equity"},
        headers=headers,
    )

    # 3. Populated Insights Check
    pop_insights = client.get("/api/v1/investments/insights", headers=headers)
    assert pop_insights.status_code == 200
    insights = pop_insights.json()["data"]
    assert len(insights) == 1
    aapl_insight = insights[0]
    assert aapl_insight["ticker"] == "AAPL"
    assert aapl_insight["analysis"]["overallSignal"] in ("Positive", "Neutral", "Negative")
    assert len(aapl_insight["analysis"]["factors"]) >= 2
    assert len(aapl_insight["reasoning"]) >= 1
    assert len(aapl_insight["considerations"]) >= 1
    assert aapl_insight["actionRecommendation"] in ("BUY", "HOLD", "REBALANCE", "TRIM")
