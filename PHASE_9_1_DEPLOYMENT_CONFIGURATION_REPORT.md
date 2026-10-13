# Phase 9.1: Deployment Configuration and CI/CD Report

## 1. Repository Structure Verified
- **Frontend**: Vite configuration confirmed. Build commands are standard (`npm run build`). No Next.js or SSR is used.
- **Backend**: FastAPI app correctly located in `backend/app/main.py`. Dependencies managed via `requirements.txt`.
- **Database Migrations**: Alembic configuration confirmed present in `backend/alembic.ini`.

## 2. Files Created and Modified
- `vercel.json` (Created) - Defines frontend routing rules for the SPA.
- `render.yaml` (Created) - Defines the Render Backend Web Service configuration, Environment variable mapping, and Pre-deploy migration command.
- `.github/workflows/ci.yml` (Created) - Defines the GitHub Actions pipeline for Pull Requests and merges to `main`.

## 3. Frontend Hosting Configuration (Vercel)
A `vercel.json` file was added to handle React Router pushState (SPA fallback routing), directing all paths `/(.*)` to `/index.html`.
The frontend build relies on setting two environment variables in the Vercel Dashboard:
- `VITE_API_BASE_URL` (Points to Render)
- `VITE_USE_MOCK_API` (Must explicitly be set to `"false"`)

No secrets (`JWT_SECRET` etc.) will be placed in Vercel.

## 4. Backend Hosting Configuration (Render)
A `render.yaml` file was created defining an Infrastructure-as-Code spec for a Web Service.
- **Python Setup**: Uses `requirements.txt`.
- **Startup**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1` (Single worker ensures the in-memory rate limiter functions properly).
- **Environment Rules**: Sets `APP_ENV=production` automatically. Secrets (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`) are marked as `sync: false`, enforcing that they are manually and securely injected in the Render Dashboard, never committed to git.

## 5. Database Connection and Migration Plan
- **Pre-Deploy Command**: The `render.yaml` specifies `alembic upgrade head` as the `preDeployCommand`. Render supports this execution context prior to starting the new web service, guaranteeing that schema updates complete safely and sequentially without concurrent web worker startup collisions.
- **Connection Format**: The `DATABASE_URL` will be standard PostgreSQL syntax modified to `postgresql+asyncpg://`, enforced by the existing `config.py` validator.

## 6. CI Workflow Behavior
The new GitHub Actions workflow (`.github/workflows/ci.yml`) runs on PRs and merges to `main`:
- Checks out code.
- Builds Frontend (`npm run build`), Lints, and checks TypeScript types.
- Builds Backend Python environment and runs the test suite (`pytest tests/`).
- **Does not require production credentials** to run tests, and **does not auto-deploy**—Vercel and Render deploy hooks should be tied to successful GitHub checks directly via their respective provider integrations.

## 7. Environment Variables Required
**Vercel Dashboard:**
- `VITE_API_BASE_URL` (e.g. `https://ai-finance-backend.onrender.com`)
- `VITE_USE_MOCK_API=false`

**Render Dashboard:**
- `DATABASE_URL` (Neon PostgreSQL Connection String)
- `JWT_SECRET` (Secure 32+ char cryptographic string)
- `OPENAI_API_KEY` (For AI Advisor)
- `CORS_ORIGINS` (e.g. `https://ai-finance-frontend.vercel.app`)

## 8. Security Risks and Release Gates
- **Required before private test deployment:** OpenAI API Key availability.
- **Required before public production launch:** Database backup and restoration must be formally demonstrated. Explicit CORS origins must be configured.
- **Required before horizontal scaling:** Redis implementation. The current `render.yaml` limits `workers` to 1. If changed, the rate limit will fragment.
- **Unresolved Risk:** The JWT token still has a 24-hour expiry with stateless logout. This is an accepted limitation for the initial launch phase.

## 9. Tests Executed and Exact Results
Executed `npm run lint && npm run build && backend/.venv/bin/pytest backend/tests/`.
- Frontend linting and type-checking passed.
- Frontend built successfully (vite build).
- Backend tests passed completely. 

## 10. Remaining Provider-Dashboard Steps
1. Create a Vercel project and link the repository. Set the `VITE_*` env variables.
2. Create a Neon Database project and generate a connection string.
3. Link the repository to Render, importing the `render.yaml` blueprint. Paste the Neon connection string and generate a strong `JWT_SECRET` via the Render dashboard.

## 11. Remaining Infrastructure-Dependent Checks
- End-to-end integration testing in the cloud environment.
- Validating the actual `alembic` execution within the Render pre-deploy context.
- Database restore drill using Neon's snapshot system.

## 12. Exact Steps Required Before the First Deployment
1. Generate the actual secure keys (`JWT_SECRET`, `OPENAI_API_KEY`).
2. Login to Neon, Render, and Vercel and create the empty projects.
3. Apply the environment variables in the provider dashboards.
4. Push this repository's `main` branch to trigger the CI checks and subsequent deployments.
