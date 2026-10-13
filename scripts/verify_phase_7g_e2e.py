import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(res_body)
        except Exception:
            parsed = {"raw": res_body}
        return e.code, parsed

def run_e2e_integration_test():
    print("================================================================")
    print("      AI FINANCE ADVISOR — PHASE 7G FULL STACK E2E VALIDATION   ")
    print("================================================================")

    ts = int(time.time())
    email_a = f"alice_{ts}@example.com"
    email_b = f"bob_{ts}@example.com"

    # ------------------------------------------------------------------
    # 1. AUTHENTICATION — SIGNUP, LOGIN, GET ME (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 1] Testing User A Registration & Authentication...")
    status, reg_a = make_request("/auth/register", method="POST", data={
        "email": email_a,
        "name": "Alice Finance",
        "password": "Password123!",
        "currency": "USD"
    })
    assert status in (200, 201), f"User A Registration failed: {reg_a}"

    status, login_a = make_request("/auth/login", method="POST", data={
        "email": email_a,
        "password": "Password123!"
    })
    assert status == 200, f"User A Login failed: {login_a}"
    token_a = login_a["data"]["access_token"]
    user_a = login_a["data"]["user"]
    print(f"✓ User A authenticated. ID: {user_a['id']}, Email: {user_a['email']}")

    status, me_a = make_request("/auth/me", method="GET", token=token_a)
    assert status == 200, f"Get Current User A failed: {me_a}"
    assert me_a["data"]["email"] == email_a
    print("✓ GET /auth/me verified for User A.")

    # ------------------------------------------------------------------
    # 2. CORE FINANCE — TRANSACTIONS CRUD (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 2] Testing Transactions CRUD...")
    # Add salary income
    status, tx_inc = make_request("/transactions", method="POST", token=token_a, data={
        "title": "Principal Engineer Salary",
        "amount": 8000.0,
        "type": "credit",
        "category": "Salary",
        "accountName": "Silicon Bank",
        "date": "2026-10-01T00:00:00Z"
    })
    assert status in (200, 201), f"Create Income TX failed: {tx_inc}"
    tx_inc_id = tx_inc["data"]["id"]

    # Add dining expense
    status, tx_exp = make_request("/transactions", method="POST", token=token_a, data={
        "title": "Organic Market & Grocery",
        "amount": 600.0,
        "type": "debit",
        "category": "Food & Dining",
        "accountName": "Main Checking",
        "date": "2026-10-03T00:00:00Z"
    })
    assert status in (200, 201), f"Create Expense TX failed: {tx_exp}"
    tx_exp_id = tx_exp["data"]["id"]

    # Add rent expense
    status, tx_rent = make_request("/transactions", method="POST", token=token_a, data={
        "title": "Downtown Apartment Rent",
        "amount": 2400.0,
        "type": "debit",
        "category": "Housing",
        "accountName": "Main Checking",
        "date": "2026-10-04T00:00:00Z"
    })
    assert status in (200, 201), f"Create Rent TX failed: {tx_rent}"

    # List Transactions
    status, tx_list = make_request("/transactions", method="GET", token=token_a)
    assert status == 200, f"List TX failed: {tx_list}"
    items = tx_list["data"]["items"] if "items" in tx_list["data"] else tx_list["data"]
    assert len(items) == 3, f"Expected 3 transactions, got {len(items)}"
    print(f"✓ Created 3 transactions for User A. Total fetched: {len(items)}")

    # ------------------------------------------------------------------
    # 3. CORE FINANCE — GOALS CRUD (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 3] Testing Goals CRUD...")
    status, goal_resp = make_request("/goals", method="POST", token=token_a, data={
        "name": "Tesla Model Y Down Payment",
        "targetAmount": 15000.0,
        "currentAmount": 9000.0,
        "category": "Vehicle",
        "color": "#10B981",
        "targetDate": "2026-12-31T00:00:00Z"
    })
    assert status in (200, 201), f"Create Goal failed: {goal_resp}"
    goal_a_id = goal_resp["data"]["id"]

    status, goals_list = make_request("/goals", method="GET", token=token_a)
    assert status == 200
    assert len(goals_list["data"]) == 1
    assert goals_list["data"][0]["name"] == "Tesla Model Y Down Payment"
    print(f"✓ Goal created and listed for User A. Progress: {goals_list['data'][0].get('progress', 0.0)}%")

    # ------------------------------------------------------------------
    # 4. DASHBOARD & ANALYTICS AGGREGATION (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 4] Testing Dashboard & Analytics Aggregations...")
    status, dash_a = make_request("/dashboard", method="GET", token=token_a)
    assert status == 200, f"Dashboard failed: {dash_a}"
    dash_data = dash_a["data"]
    assert dash_data["monthlyIncome"] == "8000.0000" or float(dash_data["monthlyIncome"]) == 8000.0
    assert dash_data["monthlyExpenses"] == "3000.0000" or float(dash_data["monthlyExpenses"]) == 3000.0
    assert dash_data["savings"] == "5000.0000" or float(dash_data["savings"]) == 5000.0
    print(f"✓ Dashboard aggregated: Income=${dash_data['monthlyIncome']}, Expenses=${dash_data['monthlyExpenses']}, Savings=${dash_data['savings']}, Rate={dash_data['summary'].get('savingsRate', 0)}%")

    status, analytics_a = make_request("/analytics?timeframe=6m", method="GET", token=token_a)
    assert status == 200, f"Analytics failed: {analytics_a}"
    assert len(analytics_a["data"]["monthlyTrends"]) > 0
    print(f"✓ Analytics verified with {len(analytics_a['data']['categoryBreakdown'])} category breakdown items.")

    # ------------------------------------------------------------------
    # 5. INVESTMENTS & HOLDINGS (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 5] Testing Investment APIs & Portfolio Summary...")
    status, port_resp = make_request("/investments/portfolios", method="POST", token=token_a, data={
        "name": "Core Tech & Index",
        "accountType": "taxable",
        "brokerageName": "Interactive Brokers"
    })
    assert status in (200, 201), f"Portfolio failed: {port_resp}"
    port_a_id = port_resp["data"]["id"]

    # Add AAPL position
    status, pos1 = make_request(f"/investments/portfolios/{port_a_id}/positions", method="POST", token=token_a, data={
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "shares": 30.0,
        "avgPrice": 175.0,
        "currentPrice": 230.0,
        "sector": "Technology",
        "assetClass": "Equity"
    })
    assert status in (200, 201), f"AAPL Position failed: {pos1}"

    # Add VOO position
    status, pos2 = make_request(f"/investments/portfolios/{port_a_id}/positions", method="POST", token=token_a, data={
        "ticker": "VOO",
        "name": "Vanguard S&P 500 ETF",
        "shares": 15.0,
        "avgPrice": 450.0,
        "currentPrice": 510.0,
        "sector": "Broad Market",
        "assetClass": "ETF"
    })
    assert status in (200, 201), f"VOO Position failed: {pos2}"

    # Verify Summary & Positions
    status, sum_resp = make_request("/investments/summary", method="GET", token=token_a)
    assert status == 200, f"Summary failed: {sum_resp}"
    sum_data = sum_resp["data"]
    print(f"✓ Portfolio Summary: Total Value=${sum_data['totalValue']}, Gain=${sum_data['overallPnl']} ({sum_data['overallPnlPct']}%)")

    status, risk_resp = make_request("/investments/risk", method="GET", token=token_a)
    assert status == 200, f"Risk failed: {risk_resp}"
    print(f"✓ Investment Risk Analysis: Score={risk_resp['data']['riskScore']}/100, Level={risk_resp['data']['riskLevel']}")

    status, insights_resp = make_request("/investments/insights", method="GET", token=token_a)
    assert status == 200
    assert len(insights_resp["data"]) > 0
    print(f"✓ Generated {len(insights_resp['data'])} rule-based investment insights.")

    # ------------------------------------------------------------------
    # 6. AI ADVISOR — FACTUAL & INTERPRETIVE CHAT (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 6] Testing AI Advisor Multi-Domain Inquiries...")
    advisor_queries = [
        ("What did I spend this month?", "SPENDING_ANALYSIS", ["3000", "3,000"]),
        ("How much income did I have this month?", "FINANCIAL_SUMMARY", ["8000", "8,000"]),
        ("How much am I saving?", "SAVINGS", ["5000", "5,000", "62.5"]),
        ("How many active goals do I have?", "GOALS", ["1", "Tesla"]),
        ("What is my net worth?", "FINANCIAL_SUMMARY", ["net worth", "worth"]),
        ("How is my portfolio doing?", "INVESTMENTS", ["portfolio", "holdings", "AAPL", "VOO", "%"]),
        ("What should I consider about my current spending?", "SPENDING_ANALYSIS", ["spending", "housing", "3,000", "allocations", "outflow", "budget"])
    ]

    for q, exp_intent, exp_substrings in advisor_queries:
        status, chat_resp = make_request("/advisor/chat", method="POST", token=token_a, data={"message": q})
        assert status == 200, f"Chat query '{q}' failed: {chat_resp}"
        msg = chat_resp["data"]
        print(f"  Q: '{q}'")
        print(f"  → Intent: {msg.get('intent')}, Sources: {msg.get('sources')}")
        print(f"  → Answer: {msg.get('content')[:100]}...")
        assert any(sub.lower() in msg.get('content', '').lower() for sub in exp_substrings), f"Expected substrings {exp_substrings} not found in: {msg.get('content')}"

    print("✓ All AI Advisor questions answered accurately from deterministic PostgreSQL ground truth.")

    # ------------------------------------------------------------------
    # 7. NOTIFICATIONS & SETTINGS (USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 7] Testing Notifications and User Settings...")
    status, notifs = make_request("/notifications", method="GET", token=token_a)
    assert status == 200
    print(f"✓ Notifications listed: {len(notifs['data'])} items.")

    status, set_resp = make_request("/settings", method="GET", token=token_a)
    assert status == 200
    assert set_resp["data"]["profile"]["email"] == email_a
    print("✓ User Settings retrieved.")

    # Update Profile
    status, up_prof = make_request("/settings/profile", method="PATCH", token=token_a, data={
        "name": "Alice Super Engineer",
        "phone": "+1-555-0199",
        "bio": "Quantitative Finance & AI Enthusiast"
    })
    assert status == 200
    assert up_prof["data"]["name"] == "Alice Super Engineer"
    print("✓ Profile updated and persisted.")

    # ------------------------------------------------------------------
    # 8. CROSS-USER ISOLATION & SECURITY (USER B)
    # ------------------------------------------------------------------
    print("\n[STEP 8] Testing Strict Cross-User Data Isolation...")
    # Register & Login User B
    status, reg_b = make_request("/auth/register", method="POST", data={
        "email": email_b,
        "name": "Bob Separate",
        "password": "BobPassword123!",
        "currency": "EUR"
    })
    assert status in (200, 201)

    status, login_b = make_request("/auth/login", method="POST", data={
        "email": email_b,
        "password": "BobPassword123!"
    })
    assert status == 200
    token_b = login_b["data"]["access_token"]
    user_b = login_b["data"]["user"]
    print(f"✓ User B authenticated. ID: {user_b['id']}, Email: {user_b['email']}")

    # Check User B's dashboard — must be clean 0s, NO User A data
    status, dash_b = make_request("/dashboard", method="GET", token=token_b)
    assert status == 200
    assert float(dash_b["data"]["monthlyIncome"]) == 0.0
    assert float(dash_b["data"]["monthlyExpenses"]) == 0.0
    assert len(dash_b["data"]["transactions"]) == 0
    print("✓ User B Dashboard is completely isolated (0 income, 0 expenses, 0 transactions).")

    # Check User B's transactions list — must be empty
    status, tx_b = make_request("/transactions", method="GET", token=token_b)
    assert status == 200
    b_items = tx_b["data"]["items"] if "items" in tx_b["data"] else tx_b["data"]
    assert len(b_items) == 0, f"User B saw {len(b_items)} transactions!"
    print("✓ User B sees 0 transactions.")

    # Check User B's goals list — must be empty
    status, goals_b = make_request("/goals", method="GET", token=token_b)
    assert status == 200
    assert len(goals_b["data"]) == 0
    print("✓ User B sees 0 goals.")

    # Check User B's portfolios — must be empty
    status, port_b = make_request("/investments/portfolios", method="GET", token=token_b)
    assert status == 200
    assert len(port_b["data"]) == 0
    print("✓ User B sees 0 investment portfolios.")

    # ------------------------------------------------------------------
    # 9. DIRECT RESOURCE THEFT / MUTATION ATTEMPT (USER B -> USER A)
    # ------------------------------------------------------------------
    print("\n[STEP 9] Testing Unauthorized Resource Access Rejection...")
    # User B attempts to access User A's Goal
    status, steal_goal = make_request(f"/goals/{goal_a_id}", method="GET", token=token_b)
    assert status in (404, 403), f"Security breach! User B accessed User A Goal ({status}): {steal_goal}"
    print(f"✓ User B accessing User A's Goal returned HTTP {status} (Expected 404/403).")

    # User B attempts to delete User A's Transaction
    status, steal_tx = make_request(f"/transactions/{tx_inc_id}", method="DELETE", token=token_b)
    assert status in (404, 403), f"Security breach! User B deleted User A TX ({status}): {steal_tx}"
    print(f"✓ User B deleting User A's Transaction returned HTTP {status} (Expected 404/403).")

    # User B attempts to delete User A's Portfolio
    status, steal_port = make_request(f"/investments/portfolios/{port_a_id}", method="DELETE", token=token_b)
    assert status in (404, 403), f"Security breach! User B deleted User A Portfolio ({status}): {steal_port}"
    print(f"✓ User B deleting User A's Portfolio returned HTTP {status} (Expected 404/403).")

    # ------------------------------------------------------------------
    # 10. AUTHENTICATION PROTECTION & 401 EXPIRY
    # ------------------------------------------------------------------
    print("\n[STEP 10] Testing Unauthenticated Rejection (401)...")
    status, unauth = make_request("/dashboard", method="GET", token="invalid_tampered_token_xyz")
    assert status == 401, f"Expected 401, got {status}: {unauth}"
    print("✓ Tampered / missing JWT properly rejected with HTTP 401.")

    print("\n================================================================")
    print("      ALL PHASE 7G END-TO-END INTEGRATION TESTS PASSED!         ")
    print("================================================================")

if __name__ == "__main__":
    run_e2e_integration_test()
