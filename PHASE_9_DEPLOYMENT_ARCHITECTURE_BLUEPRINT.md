# Phase 9: Deployment Architecture Blueprint

## 1. Current Architecture Findings
- **Frontend**: React SPA using Vite (`npm run build`). Outputs static HTML/JS/CSS to `/dist`. Routing via React Router requires a static host configured for SPA fallback (redirecting all 404s to `index.html`).
- **Backend**: Python FastAPI application using asynchronous endpoints. Managed by Uvicorn.
- **Database**: PostgreSQL accessed via `asyncpg` and SQLAlchemy.
- **Migrations**: Alembic handles schema versioning. Migrations must be run via `alembic upgrade head` safely prior to app startup.
- **Authentication**: JWT access tokens (24-hour expiry, stateless).
- **Rate Limiting**: Custom in-memory `SlidingWindowRateLimiter`. Limits are stored per Python process and reset on restarts.
- **External Dependencies**: OpenAI (AI Advisor) requiring `OPENAI_API_KEY`.
- **Health Checks**: Available at `/api/v1/health` (Liveness) and `/api/v1/health/ready` (DB Readiness).

## 2. Deployment Options and Comparison Matrix

| Criteria | Option A: PaaS (Render/Railway) | Option B: Static + Managed (Vercel + Render + Neon) | Option C: IaaS Cloud (AWS ECS + RDS) |
| :--- | :--- | :--- | :--- |
| **Frontend Hosting** | Built-in Static Sites (Free/Cheap) | Vercel / Netlify (Free Tier) | AWS S3 + CloudFront |
| **Backend Hosting** | Managed Web Service | Render or Heroku Web Service | AWS ECS (Fargate) |
| **Database** | Managed PostgreSQL add-on | Neon (Serverless Postgres) or Supabase | AWS RDS (PostgreSQL) |
| **Estimated Cost/mo (Small Scale)** | ~$15 - $25 | ~$15 - $25 (Mostly Backend/DB compute) | ~$50 - $100+ (Load Balancer, NAT, RDS) |
| **Operational Burden** | Very Low (Push to deploy) | Low (Push to deploy across platforms) | High (VPC, IAM, Terraform needed) |
| **Scaling** | Vertical scale easy; horizontal requires Redis | Horizontal scaling requires Redis | Full auto-scaling (requires Redis) |
| **Security / Compliance**| Shared responsibility; good defaults | Shared responsibility; good defaults | Complete control; suitable for strict compliance |
| **Recommendation** | **Runner-Up** (All-in-one simplicity) | **Recommended** (Best-in-class tools) | Not recommended for initial launch |

## 3. Recommended Architecture: Option B (Best-in-Class Managed)
**Why**: This provides the best developer experience, lowest operational overhead for a small team, and isolates the frontend CDN from the backend compute, while keeping costs strictly bound.

### Proposed Service Topology
- **Frontend**: **Vercel** (or Netlify). Connects directly to the GitHub repo, builds on push, serves assets globally via Edge CDN, and natively handles SPA routing.
- **Backend**: **Render** (Web Service). Connects to repo, builds Python environment, and runs `uvicorn app.main:app`. Can auto-deploy on branch pushes.
- **Database**: **Neon** or **Supabase** (Serverless PostgreSQL). Scales to zero if unused, providing an asynchronous connection string (`postgresql+asyncpg://`) injected into Render.

## 4. Environment and Secret-Management Plan
- **Vercel**: Environment variables (`VITE_API_BASE_URL`, `VITE_APP_ENV`, `VITE_USE_MOCK_API`) are set in the Vercel dashboard. No secrets exist here.
- **Render**: Secrets (`JWT_SECRET`, `OPENAI_API_KEY`, `DATABASE_URL`) are injected via the Render dashboard's Environment Variables section.
- **Validation**: FastAPI's `pydantic` configuration natively enforces these rules on boot, failing instantly if production secrets are missing.

## 5. Database and Migration Plan
- **Database Initialisation**: Create the DB in the managed provider (e.g. Neon).
- **Migration Execution**: Alembic migrations will be run as a "Build Command" or "Pre-Deploy Command" in Render (`alembic upgrade head`) before the new FastAPI worker starts.

## 6. CI/CD Design
- **Pipeline**: GitHub Actions or native Provider Git integrations (Vercel/Render).
- **Checks**: On Pull Request to `main`, run `pytest` and `npm run lint`.
- **Deployment**: On merge to `main`, Vercel deploys frontend, Render deploys backend.

## 7. Backup and Recovery Plan
- **Backup**: Rely on the managed PostgreSQL provider's automated Point-In-Time-Recovery (PITR) or daily snapshots.
- **Recovery Drill**: A formal drill must be run post-infrastructure provisioning, restoring a snapshot to a staging database and running migrations.

## 8. Security and Release Gates

| Requirement | Classification | Notes |
| :--- | :--- | :--- |
| Inject secure 32+ char `JWT_SECRET` | **Required before launch** | Enforced by current codebase. |
| Set explicit `CORS_ORIGINS` | **Required before launch** | Prevent unauthorized API consumption. |
| HTTPS enforced | **Required before launch** | Vercel and Render handle TLS automatically. |
| Test DB Backup/Restore | **Required before launch** | Protect financial data. |
| Redis for Rate Limiting | **Required before horiz. scaling**| In-memory limiter breaks on multiple workers. Limit launch to 1 worker instance initially. |
| Short-lived JWTs & Revocation | **Recommended improvement** | Address stateless 24-hour token limitation. |

## 9. Initial Deployment Sequence
1. **Provision DB**: Create PostgreSQL instance and secure the `DATABASE_URL`.
2. **Deploy Backend**: Configure Render with `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`. Set `APP_ENV=production`. Deploy and verify `/api/v1/health`.
3. **Deploy Frontend**: Configure Vercel with `VITE_API_BASE_URL` pointing to the Render URL. Set `VITE_USE_MOCK_API=false`. Deploy.
4. **Smoke Test**: Execute the `PRODUCTION_SMOKE_TEST_CHECKLIST.md`.

## 10. Rollback Strategy
- **Frontend**: Instant rollback via Vercel dashboard.
- **Backend Code**: Redeploy previous commit in Render.
- **Database**: Rollback code first. If DDL was destructive (e.g., dropped columns), restore from managed provider backup snapshot.

## 11. Risks and Unresolved Decisions
- **Worker Scaling**: We must restrict the backend to a **single worker/instance** initially. If we deploy multiple instances, the in-memory rate limiter fragments. 
- **Token Revocation**: Stateless 24h tokens mean immediate account lockdown upon compromise requires a database-level intervention (marking `is_active=False` and adding middleware to check it on every request).
