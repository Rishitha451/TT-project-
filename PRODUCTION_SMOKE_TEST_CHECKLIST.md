# Production Smoke Test Checklist

Execute this checklist immediately after completing a production deployment.
Do not test with real financial accounts during the smoke test.

## 1. Pre-Release Verification
- [ ] Backend is running.
- [ ] Database migrations applied successfully.
- [ ] Frontend static assets deployed and reachable.
- [ ] `VITE_USE_MOCK_API` is set to `false` (verified in network requests).

## 2. Infrastructure Health
- [ ] `GET <backend_url>/api/v1/health` returns `200 OK`.
- [ ] `OPTIONS <backend_url>/api/v1/auth/login` returns correct CORS headers.

## 3. Authentication Flow
- [ ] Register a new test user account.
- [ ] Log out.
- [ ] Log in with the test user account.
- [ ] Verify JWT token is received and attached to subsequent requests.
- [ ] Verify incorrect password results in `401 Unauthorized` without leaking user existence.

## 4. Core Finance Features
- [ ] **Transactions**: Create a new income and expense transaction. Verify they appear in the list.
- [ ] **Dashboard**: Verify the dashboard loads and reflects the new transactions in Net Worth.
- [ ] **Financial Profile**: Update risk tolerance and save. Refresh the page to verify persistence.

## 5. AI Advisor Resilience
- [ ] Send a basic query: "What is my net worth?"
- [ ] Verify the response includes the correct calculated net worth.
- [ ] Verify response time is within acceptable limits (< 3 seconds for fast-path).

## 6. Access Control & Security
- [ ] Attempt to access a protected route (e.g., `/api/v1/transactions`) without an Authorization header. Expect `401`.
- [ ] (Optional if multi-user test accounts exist) Register a second test user. Verify the second user cannot see the first user's transactions.

## 7. SPA Routing
- [ ] Navigate to the `/dashboard` route directly via the browser address bar. Verify it does not return a 404 error (verifying SPA rewrite rules).
