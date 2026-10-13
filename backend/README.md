# AI Finance Advisor — FastAPI Backend & Persistence Layer

FastAPI backend architecture and SQLAlchemy 2.x relational persistence layer for the **AI Finance Advisor & Investment Intelligence Platform**.

---

## 🏗 Architecture Overview

```text
PSE-Project/
├── src/                                  # React 19 Frontend (Phases 1–6)
│
└── backend/
    ├── app/
    │   ├── main.py                       # Application factory, lifespan, CORS, middleware, exceptions
    │   │
    │   ├── core/                         # Core infrastructure
    │   │   ├── config.py                 # Pydantic Settings & environment variables
    │   │   ├── logging.py                # Structured logging with Correlation Request ID filter
    │   │   ├── exceptions.py             # Custom app exceptions & normalized error handlers
    │   │   └── middleware.py             # Correlation Request ID (X-Request-ID) & process timing
    │   │
    │   ├── db/                           # Database & Session configuration
    │   │   ├── base.py                   # SQLAlchemy 2.0 DeclarativeBase, naming conventions, Mixins
    │   │   └── session.py                # Async engine, sessionmaker, and lifecycle hooks
    │   │
    │   ├── api/                          # Versioned API routes
    │   │   ├── router.py                 # Root router (/api/v1)
    │   │   └── v1/
    │   │       ├── health.py             # GET /api/v1/health
    │   │       ├── auth.py               # Placeholder router (501 Not Implemented)
    │   │       ├── dashboard.py          # Placeholder router (501 Not Implemented)
    │   │       ├── transactions.py       # Placeholder router (501 Not Implemented)
    │   │       ├── goals.py              # Placeholder router (501 Not Implemented)
    │   │       ├── analytics.py          # Placeholder router (501 Not Implemented)
    │   │       ├── reports.py            # Placeholder router (501 Not Implemented)
    │   │       ├── notifications.py      # Placeholder router (501 Not Implemented)
    │   │       ├── settings.py           # Placeholder router (501 Not Implemented)
    │   │       ├── investments.py        # Placeholder router (501 Not Implemented)
    │   │       └── advisor.py            # Placeholder router (501 Not Implemented)
    │   │
    │   ├── models/                       # SQLAlchemy 2.0 Declarative Entities
    │   │   ├── user.py                   # User entity with cascading relationships
    │   │   ├── transaction.py            # Transaction entity (Numeric(18, 4))
    │   │   ├── goal.py                   # Goal entity (Numeric(18, 4))
    │   │   ├── notification.py           # Notification entity with compound indexes
    │   │   ├── settings.py               # UserSettings entity (profile + preferences)
    │   │   ├── investment.py             # InvestmentPortfolio & InvestmentPosition
    │   │   └── report.py                 # FinancialReport entity
    │   │
    │   ├── repositories/                 # Asynchronous Persistence Layer
    │   │   ├── base.py                   # BaseRepository[T] generic async CRUD
    │   │   ├── user_repository.py        # UserRepository
    │   │   ├── transaction_repository.py # TransactionRepository
    │   │   ├── goal_repository.py        # GoalRepository
    │   │   ├── notification_repository.py# NotificationRepository
    │   │   ├── settings_repository.py    # SettingsRepository
    │   │   ├── investment_repository.py  # InvestmentRepository
    │   │   └── report_repository.py      # FinancialReportRepository
    │   │
    │   ├── schemas/                      # Pydantic v2 validation contracts
    │   │   ├── common.py                 # ApiResponse[T], ApiErrorDetail, PaginatedResponse
    │   │   ├── user.py                   # UserBase, UserCreate, UserUpdate, UserRead
    │   │   ├── transaction.py            # TransactionBase, Create, Update, Read
    │   │   ├── goal.py                   # GoalBase, Create, Update, Read
    │   │   ├── notification.py           # NotificationBase, Create, Update, Read
    │   │   ├── settings.py               # UserSettingsRead, UserSettingsUpdate
    │   │   ├── investment.py             # InvestmentPortfolio, InvestmentPosition, Summary
    │   │   ├── report.py                 # FinancialReportRead, FinancialReportCreate
    │   │   └── health.py                 # HealthStatus
    │   │
    │   └── dependencies/                 # FastAPI Dependency Injection
    │       ├── auth.py                   # get_current_user_token placeholder
    │       └── database.py               # get_db AsyncSession provider
    │
    ├── alembic/                          # Alembic database migrations
    │   ├── env.py                        # Async migration execution
    │   └── versions/                     # Revision migration scripts
    ├── alembic.ini                       # Alembic CLI configuration
    │
    ├── tests/                            # Pytest Test Suite
    │   ├── conftest.py                   # In-memory SQLite async fixtures & client setup
    │   ├── test_health.py                # Health check tests
    │   ├── test_routing.py               # /api/v1 versioning & placeholder tests
    │   ├── test_errors.py                # Error formatting & status code tests
    │   ├── test_cors.py                  # CORS origin verification
    │   ├── test_models.py                # Model constraints, precision, and cascades
    │   ├── test_repositories.py          # Repository persistence operations
    │   └── test_migrations.py            # Alembic upgrade / downgrade validation
    │
    ├── .env.example                      # Safe placeholder environment configuration
    ├── pytest.ini                        # Pytest configuration
    ├── requirements.txt                  # Pinned dependencies
    └── README.md                         # Documentation
```

---

## 🚀 Setup & Execution

### 1. Virtual Environment Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Database Migrations
```bash
# Upgrade to latest migration head
alembic upgrade head

# Downgrade 1 revision (if needed)
alembic downgrade -1
```

### 3. Run Automated Tests
```bash
# Run all tests (30/30 unit, integration, model, and migration tests)
pytest -v
```

### 4. Start Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Health Check: `http://127.0.0.1:8000/api/v1/health`
- Swagger UI Documentation: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`
