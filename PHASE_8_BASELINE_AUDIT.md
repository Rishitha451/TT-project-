# Phase 8A - Baseline Audit

## 1. Discovery and Overview
- **Frontend Architecture**: React 19 + Vite + Tailwind 4 (inferred from `package.json` and `vite.config.ts`).
  - Uses `react-router-dom` for routing, `zustand` for state management, `react-query` for data fetching.
  - API Client (`src/lib/api-client.ts`) supports real and mock modes based on environment variables (`VITE_API_MODE`, `VITE_USE_MOCK_API`).
- **Backend Architecture**: FastAPI backend.
  - Entry point at `backend/app/main.py`.
  - Pydantic Settings in `backend/app/core/config.py` handling environment variables.

## 2. Configuration & Environment Variables
- **Findings**: `.env` and `.env.example` exist in both frontend and backend root.
- **Risks**:
  - `backend/app/core/config.py` has a default `JWT_SECRET` embedded in code. This is dangerous if deployed to production without an override.
  - `DEBUG` is set to `True` by default in the settings class.
  - `CORS_ORIGINS` defaults to localhost domains, which is good for dev, but requires explicit production domain configuration.

## 3. Authentication and Security
- **Findings**:
  - JWT tokens used with Argon2 for password hashing (`backend/app/core/security.py`).
  - Token validity is very long (1440 minutes / 24 hours).
  - CORS middleware is configured correctly but currently limited to dev origins.
- **Risks**:
  - A 24-hour JWT token with no revocation mechanism implies logout is strictly stateless (client-side only).
  - Rate limiting for Advisor endpoints (`backend/app/core/rate_limiter.py`) is an in-memory sliding window. This will not scale or function correctly across multiple worker processes or containers.

## 4. Database and Financial Data
- **Findings**:
  - Uses AsyncPG with PostgreSQL (`postgresql+asyncpg://`).
  - SQLAlchemy configured with connection pooling (`pool_size=10`).
  - Alembic is set up (`backend/alembic/env.py`) with multiple migration scripts identified.
- **Missing Infrastructure**: Production database URL not provided; requires safe migration runbook.

## 5. Rate Limiting and Abuse Protection
- **Findings**: `SlidingWindowRateLimiter` is implemented in-memory for the AI Advisor endpoint (30 requests/60s).
- **Risks**: Bypassed upon process restarts, and fragmented if multiple web workers/pods are running. A Redis-backed or distributed solution may be required if deploying horizontally.

## 6. Logging, Health, and Observability
- **Findings**: Custom RequestContextMiddleware handles some correlation IDs (e.g. `X-Request-ID`). 
- **Missing**: No advanced production observability metrics configured (Datadog/NewRelic/Prometheus).

## 7. CI, Testing, and Deployment
- **Findings**:
  - Backend has a comprehensive Pytest suite (`backend/tests/`).
  - No explicit `.github/workflows` or CI/CD pipelines identified.
  - No Dockerfile or containerization setup found in the codebase.
- **Risks**: Deployment infrastructure is entirely undefined (no provider selected).

## 8. Verified vs Inferred
- **Verified**: Frontend framework, Backend API structure, DB engine (PostgreSQL), Migration setup, JWT Auth presence, Rate limiter type.
- **Inferred**: Stateless logout (implied by 24h JWT without a token blocklist), API Client mock behavior (implied by `api-client.ts` code).
- **Could not execute**: CI workflows, production build against real endpoints, E2E deployment tests.
- **Decisions Requiring Approval**: Target deployment platform (AWS/GCP/Vercel/Heroku?), Database hosting (RDS/Neon/Supabase?), Secret Management (AWS Secrets, Azure KeyVault, Doppler?), Distributed Rate Limiter strategy (Redis vs single instance limit).
