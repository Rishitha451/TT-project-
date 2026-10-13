# Production Environment Variables

## Backend (`backend/.env`)
These variables must be injected into the backend compute environment. **DO NOT** commit real values to version control.

| Variable | Required | Description | Example / Allowed Values |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | No | Name of the app | `AI Finance Advisor` |
| `APP_ENV` | **Yes** | Environment tier | Must be `production` |
| `API_V1_PREFIX` | No | API prefix | `/api/v1` |
| `CORS_ORIGINS` | **Yes** | Allowed frontend domains | `["https://my-app.com"]` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host/db` |
| `JWT_SECRET` | **Yes** | Secret for signing tokens | (32+ char random string) |
| `JWT_ALGORITHM` | No | Signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| No | Token lifespan (minutes)| `1440` |
| `OPENAI_API_KEY` | **Yes** | OpenAI secret key | `sk-...` |

*Note: Due to our rigorous startup validation (`app/core/config.py`), if `APP_ENV` is `production`, the backend will refuse to start if `DATABASE_URL` is local, or if `JWT_SECRET` uses the default development value.*

## Frontend (`.env`)
These variables are injected at **build time**.

| Variable | Required | Description | Example / Allowed Values |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | Public URL of backend | `https://api.my-app.com/api/v1` |
| `VITE_APP_ENV` | **Yes** | Environment tier | `production` |
| `VITE_USE_MOCK_API` | **Yes** | Disables local mock data | `false` |
