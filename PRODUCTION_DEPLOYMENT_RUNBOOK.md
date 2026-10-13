# Production Deployment Runbook

## 1. Overview
This runbook provides provider-neutral deployment instructions for the AI Finance Advisor. It is structured to ensure that infrastructure prerequisites, environment variables, secrets, and database migrations are correctly staged before application traffic is served.

## 2. Infrastructure Requirements (To Be Decided)
Before deploying, the following infrastructure must be provisioned:
- **Relational Database**: PostgreSQL (e.g., AWS RDS, Supabase, Neon).
- **Backend Compute**: Python environment for FastAPI (e.g., AWS ECS, Render, Google Cloud Run, Heroku).
- **Frontend Hosting**: Static file host for React SPA (e.g., Vercel, Netlify, AWS S3+CloudFront).
- **Key Management**: A secure vault for environment variables (e.g., AWS Secrets Manager, Doppler).

## 3. Deployment Sequence

### Step 1: Provision Infrastructure & Secrets
- Create the production PostgreSQL database. Note the connection URI.
- Generate a 32+ character cryptographically secure random string for `JWT_SECRET`.
- Configure the environment variables on the backend compute service (see `PRODUCTION_ENVIRONMENT_VARIABLES.md`).

### Step 2: Database Migrations
- Deploy the backend codebase to a worker/runner (or CI pipeline).
- Do **NOT** run migrations concurrently on application startup.
- Execute the Alembic migrations against the production database:
  ```bash
  cd backend
  alembic upgrade head
  ```

### Step 3: Deploy Backend API
- Build the Python environment (using `requirements.txt`).
- Start the Uvicorn workers:
  ```bash
  cd backend
  uvicorn app.main:app --host 0.0.0.0 --port 8000
  ```
  *(Note: In production, consider using `gunicorn` with `uvicorn` workers).*
- Verify backend health by hitting `/api/v1/health` and checking for `{"status": "ok"}`.

### Step 4: Deploy Frontend SPA
- In the frontend environment, set the required build variables (e.g., `VITE_API_BASE_URL`).
- Build the static assets:
  ```bash
  npm install
  npm run build
  ```
- Deploy the `/dist` folder to the static hosting provider.
- **Important**: Ensure the host is configured for SPA routing. All 404 requests for non-asset routes must be rewritten to `/index.html`.

## 5. Rollback Procedure
- **Frontend**: Re-deploy the previous commit's build artifact.
- **Backend (Code)**: Re-deploy the previous container or commit.
- **Backend (Database)**: Refer to `DATABASE_MIGRATION_RUNBOOK.md` for safe downgrade procedures, or `DATABASE_BACKUP_AND_RECOVERY.md` if DDL recovery is required.
