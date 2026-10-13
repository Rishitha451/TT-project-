# PHASE: FINANCIAL ONBOARDING & MANUAL FINANCIAL PROFILE REPORT

## 1. Executive Summary & Problem Definition

### The Gap
Previously, upon newly registering and entering the AI Finance Advisor application, new users encountered an unpersonalized dashboard displaying ₹0 across Net Worth, Monthly Income, Monthly Expenses, and Savings. This occurred because no baseline financial profile existed and the user had not yet recorded any live transactions. Furthermore, hardcoded placeholder percentage changes (e.g. `+4.2%`, `-2.1%`, `33.8% savings rate`) produced misleading financial signals on an empty dashboard, and the AI Advisor lacked access to the user's real-world financial situation unless artificial mock transactions were manually created.

### The Solution
We designed and implemented a production-grade **Financial Onboarding & Manual Financial Profile** feature adhering strictly to full-stack persistence, JWT tenancy isolation, PostgreSQL decimal precision, deterministic arithmetic, and cross-module integration across Dashboard, Analytics, Goals, Investments, AI Advisor, and Settings.

---

## 2. Architecture & Persistence Flow

```
React Onboarding Flow (9 Steps)
       │
       ▼ (REST / JSON with JWT Authorization)
Central API Client Layer (`apiClient.post('/financial-profile')`)
       │
       ▼
FastAPI Authenticated Router (`/api/v1/financial-profile`)
       │
       ▼ (User ID derived exclusively from JWT claim)
FinancialProfileService (Authoritative Decimal Arithmetic & Validations)
       │
       ▼
FinancialProfileRepository (SQLAlchemy 2.0 Async ORM)
       │
       ▼
PostgreSQL / SQLite Database (`financial_profiles` Table)
```

---

## 3. UX & Onboarding Workflow

### 3.1 New User Experience
- When a user logs in or registers without a completed baseline profile, the system displays the non-intrusive **"Let's set up your finances"** prompt:
  - **Title:** `Let's set up your finances`
  - **Subtitle:** `Add your financial information so AI Finance Advisor can personalize your dashboard, analytics, goals, and financial guidance.`
  - **Primary CTA:** `Set Up My Finances` (launches the 9-step wizard)
  - **Secondary Action:** `Skip for now` (stores session flag, avoids repeated popups, provides a top reminder banner and dashboard CTA without blocking app access).

### 3.2 9-Step Onboarding Wizard
The onboarding flow features a clean progress indicator `1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7 ─ 8 ─ 9` with back/next navigation and non-destructive state preservation:
1. **Step 1 — Basic Financial Information:** Preferred currency (`INR`, `USD`, `EUR`, `GBP`) and employment status (`Employed`, `Self-employed`, `Business owner`, `Freelancer`, `Student`, `Retired`, `Other`).
2. **Step 2 — Monthly Income:** Primary monthly income, additional monthly income, source breakdown (`Salary`, `Freelance`, `Business`, `Investments`), and auto-computed total income.
3. **Step 3 — Monthly Expenses:** 12 category inputs (`Housing / Rent`, `Food & Groceries`, `Transportation`, `Utilities`, `Healthcare`, `Insurance`, `Education`, `Entertainment`, `Shopping`, `Subscriptions`, `EMIs / Loan Payments`, `Other`) with real-time total calculation.
4. **Step 4 — Savings & Cash:** Current savings, bank/cash liquid balances, dedicated emergency fund, and auto-computed liquid reserves.
5. **Step 5 — Assets & Investments:** Physical assets (`Property`, `Gold`, `Vehicles`) and investment holdings (`Mutual Funds`, `Stocks`, `ETFs`, `Bonds`, `Retirement accounts`), clearly labeled *"Manually entered current value"*.
6. **Step 6 — Debts & Liabilities:** Outstanding balances, monthly EMIs, and interest rates for loans and credit cards. Includes explicit security reassurance (no sensitive account numbers, PINs, or bank passwords requested).
7. **Step 7 — Financial Goals:** Interactive goal creation (Name, Target Amount, Current Funded Amount, Target Date, Category) seamlessly reusing the platform's canonical `Goal` database records.
8. **Step 8 — Risk Profile:** 3-question deterministic risk assessment evaluating risk tolerance tier, investment time horizon, and reaction to market corrections to derive an objective score (0–100) and risk tier (`Conservative`, `Moderate`, `Aggressive`).
9. **Step 9 — Review & Save:** Comprehensive summary card with inline edit triggers jumping directly to any step, concluding with the `Save Financial Profile` action.

---

## 4. Backend Data Model & Database Schema

### 4.1 `FinancialProfile` Entity (`backend/app/models/financial_profile.py`)
- `id`: UUID (Primary Key, String 36)
- `user_id`: UUID (String 36, ForeignKey `users.id` with `ondelete="CASCADE"`, unique=True, indexed)
- `currency`: String(10) (default `"INR"`)
- `employment_status`: String(100), optional
- `monthly_income`: `Numeric(18, 4, asdecimal=True)`
- `additional_income`: `Numeric(18, 4, asdecimal=True)`
- `income_sources`: `JSON`
- `monthly_expenses`: `Numeric(18, 4, asdecimal=True)`
- `expense_categories`: `JSON`
- `savings`: `Numeric(18, 4, asdecimal=True)`
- `cash_balance`: `Numeric(18, 4, asdecimal=True)`
- `emergency_fund`: `Numeric(18, 4, asdecimal=True)`
- `total_assets`: `Numeric(18, 4, asdecimal=True)`
- `asset_breakdown`: `JSON`
- `total_investments`: `Numeric(18, 4, asdecimal=True)`
- `investment_breakdown`: `JSON`
- `total_debt`: `Numeric(18, 4, asdecimal=True)`
- `debt_breakdown`: `JSON`
- `risk_profile`: String(50) (default `"Moderate"`)
- `risk_score`: Integer (default `50`)
- `onboarding_completed`: Boolean (default `False`)
- `created_at`, `updated_at`: `DateTime(timezone=True)`

### 4.2 Alembic Migration
- Created migration: `backend/alembic/versions/c1f54a8e2b34_add_financial_profile.py` creating the `financial_profiles` table, unique index, and foreign key constraints.

---

## 5. API Endpoints

All endpoints require JWT Bearer authentication (`current_user: User = Depends(get_current_user)`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/financial-profile` | Retrieves current user's baseline financial profile and computed liquid savings / net worth. |
| `GET` | `/api/v1/financial-profile/status` | Returns `{ onboardingCompleted: bool, hasProfile: bool }`. |
| `POST` | `/api/v1/financial-profile` | Creates or updates the full financial baseline profile from onboarding, syncs base currency, and creates initial `Goal` records. |
| `PATCH` | `/api/v1/financial-profile` | Partially updates baseline figures (e.g., from Settings). |

---

## 6. Cross-Module Integrations

### 6.1 Dashboard Integration (`DashboardService`)
- **Baseline Prioritization:** If a user has no transactions for the active month but possesses a completed `FinancialProfile`, the dashboard renders the baseline `monthly_income`, `monthly_expenses`, `savings`, and `savingsRate`, calculates `net_worth` = (assets + investments + liquid cash - debt), and populates spending charts from `expense_categories`.
- **Honest Empty State:** If the profile is incomplete and no transactions exist, all metrics display honest `₹0` with subtitle `"No financial data yet"` and a direct CTA `"Complete Financial Profile →"`, eliminating misleading fake percentage shifts.
- **Transaction Harmony:** When actual transactions exist, transactions determine current cashflows, and lifetime net worth is computed without duplicate counting.

### 6.2 Analytics Integration (`AnalyticsService`)
- If transactions are absent, the Analytics module displays the baseline cashflow overview and category distribution with a single active month baseline trend point, avoiding fabricated historical timelines.

### 6.3 AI Advisor Integration (`AIContextService` & `AdvisorService`)
- AI Advisor context builder automatically injects a verified `<FINANCIAL_PROFILE (USER BASELINE)>` block containing income, expenses, liquid reserves, emergency fund, assets, debt obligations, and risk tier.
- Deterministic fast paths and fallback generation answer queries such as:
  - *"How much debt do I have?"* -> Returns exact total recorded debt.
  - *"Am I saving enough?"* -> Evaluates savings rate (e.g. 43.8%) and monthly savings against standard 20% guidelines.
  - *"How much emergency savings do I have?"* -> Evaluates emergency fund coverage against monthly expense burn rate.
  - *"What is my current financial position?"* -> Provides a structured summary of net worth, income, expenses, savings, and debt.

### 6.4 Goals & Settings Integration
- Goals entered during Step 7 are committed directly to the `goals` table via `GoalRepository`.
- A dedicated **"Financial Profile"** tab in `Settings.tsx` (`src/features/settings/components/FinancialProfileTab.tsx`) enables viewing, editing, and updating all baseline parameters with TanStack Query invalidation.

---

## 7. Automated Test Validation

### 7.1 Backend Unit & Integration Tests (`backend/tests/`)
- `test_financial_profile.py`:
  - `test_get_status_incomplete`: PASS
  - `test_create_financial_profile_full_onboarding`: PASS
  - `test_update_financial_profile_patch`: PASS
  - `test_cross_user_isolation`: PASS
  - `test_unauthenticated_access`: PASS
  - `test_dashboard_uses_financial_profile_baseline`: PASS
  - `test_ai_advisor_uses_financial_profile_context`: PASS
- `test_e2e_financial_onboarding.py`:
  - Full lifecycle (Register -> Status Check -> Initial Empty Dashboard -> Save Profile -> Dashboard Verification -> Analytics Verification -> Goals Verification -> AI Advisor Question Verification -> Relogin Persistence -> Cross-User Isolation): PASS
- **Total Backend Test Suite:** **80 / 80 Passed (100%)**

### 7.2 Frontend Compilation & Type Checking
- `npm run build` (`tsc -b && vite build`): **PASS (0 errors, clean production bundle)**.

---

## 8. Final Checklist & Acceptance Criteria

- [x] New user can complete financial onboarding
- [x] User can manually enter income
- [x] User can manually enter expenses
- [x] User can manually enter savings
- [x] User can manually enter cash/bank balance
- [x] User can manually enter assets
- [x] User can manually enter investments
- [x] User can manually enter debts
- [x] User can create financial goals
- [x] User can select risk profile
- [x] Data persists in PostgreSQL
- [x] Data belongs to authenticated user (JWT derived)
- [x] User can edit the profile later from Settings
- [x] Dashboard reflects profile
- [x] Empty dashboard no longer shows misleading percentages
- [x] AI Advisor can use financial profile context
- [x] Existing Goals architecture is reused
- [x] Existing Investments architecture is reused
- [x] Cross-user isolation passes
- [x] Logout/login persistence passes
- [x] Frontend validation passes
- [x] Backend validation passes
- [x] TypeScript passes
- [x] Production build passes
- [x] Backend tests pass (80/80)
- [x] E2E test passes
- [x] Existing application functionality remains intact

---

## 9. Final Decision & Status

```text
FINANCIAL ONBOARDING & PROFILE

Status: COMPLETE

Frontend: PASS
Backend: PASS
Database: PASS
API: PASS
Authentication: PASS
Dashboard Integration: PASS
Analytics Integration: PASS
Goals Integration: PASS
Investment Integration: PASS
AI Advisor Integration: PASS
Security: PASS
Cross-User Isolation: PASS
E2E: PASS
TypeScript: PASS
Build: PASS

Tests:
Backend: 80/80 PASS
E2E: 1/1 PASS

Known Limitations:
None. The implementation operates in both live PostgreSQL mode and mock API mode.

Final Decision:
FEATURE COMPLETE — READY FOR REVIEW
```
