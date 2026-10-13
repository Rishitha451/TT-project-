# Database Migration Runbook

## 1. Migration Overview
The AI Finance Advisor uses Alembic for SQLAlchemy database migrations.
Migrations manage schema changes safely over time.

## 2. Prerequisites
- Target database must be accessible.
- Environment variable `DATABASE_URL` must be set correctly.
- `alembic` CLI must be installed (`pip install -r backend/requirements.txt`).

## 3. Safe Execution in Production
**Never** run `alembic upgrade head` automatically on application startup in production if running multiple instances (this can cause race conditions and table locking issues).

### 3.1 Review Pending Migrations
Before applying migrations, always check the current state:
```bash
cd backend
alembic current
alembic history
```

### 3.2 Execute Migration
Run the migration script during a controlled deployment window:
```bash
cd backend
# Optional: Backup the DB before running this step!
alembic upgrade head
```

## 4. Failure Handling and Rollback
If a migration fails:
1. Identify the failing revision. Alembic transactions will generally roll back DDL if supported by PostgreSQL.
2. To manually downgrade one revision:
```bash
alembic downgrade -1
```
**Warning**: Downgrading may result in data loss (e.g., if the migration dropped a column, the downgrade cannot restore the data unless a manual backup is restored). For financial data, a full database restore is often safer than a DDL downgrade.

## 5. Adding New Migrations (Development)
When changing SQLAlchemy models in `backend/app/models/`:
1. Generate the migration script:
```bash
alembic revision --autogenerate -m "Description of change"
```
2. **Crucial**: Review the generated script in `backend/alembic/versions/`. Autogenerate does not always perfectly capture column renames or index drops. Fix it manually if needed.
3. Apply locally:
```bash
alembic upgrade head
```
