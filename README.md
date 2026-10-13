# AI Finance Advisor & Investment Intelligence Platform

An intelligent, full-stack personal finance and investment advisor designed to deliver real-time financial tracking, portfolio insights, market sentiment analysis, goal planning, and AI-driven advisory capabilities.

---

## 🌟 Key Features

- **Dynamic Financial Dashboard**: Real-time net worth tracking, monthly spending breakdown, cash flow analysis, and recent transactions.
- **AI Financial Advisor**: Conversational AI advisor equipped with context-aware financial intelligence, prompt recommendations, and intent classification.
- **Investment & Portfolio Analytics**: Multi-asset tracking (stocks, ETFs, crypto, commodities), asset allocation, unrealized/realized P&L, and market risk sentiment gauge.
- **Financial Onboarding & Profiling**: Comprehensive onboarding flow capturing risk tolerance, financial goals, income sources, and investment preferences.
- **Goal Management & Forecasting**: Set, monitor, and simulate milestone timelines with automated progress tracking.
- **Transaction & Expense Tracking**: Categorized ledger with merchant identification, recurring charge detection, and audit trail.
- **Reports & Intelligence**: Exportable monthly/quarterly reports, tax summaries, and AI-generated fiscal recommendations.

---

## 🏗 System Architecture

```text
├── src/                                  # React + TypeScript + Vite Frontend
│   ├── app/                              # App entry, router & providers
│   ├── components/                       # Reusable UI component library & common states
│   ├── features/                         # Modular domain features
│   │   ├── advisor/                      # AI conversational advisor interface
│   │   ├── analytics/                    # Financial charts & metrics
│   │   ├── auth/                         # User authentication & token management
│   │   ├── dashboard/                    # Primary executive financial dashboard
│   │   ├── goals/                        # Savings & target management
│   │   ├── investments/                  # Portfolio, market sentiment & risk analysis
│   │   ├── notifications/                # Real-time alert notifications
│   │   ├── onboarding/                   # Multi-step financial onboarding flow
│   │   ├── reports/                      # Financial summaries & report generator
│   │   ├── settings/                     # User profile & financial configuration
│   │   └── transactions/                 # Ledger, categorization & history
│   ├── lib/                              # API client, contracts & utility functions
│   └── services/mock/                    # Comprehensive mock data & offline fallbacks
│
└── backend/                              # FastAPI + SQLAlchemy Backend
    ├── app/
    │   ├── api/v1/                       # Versioned REST API endpoints
    │   ├── core/                         # Config, security, logging & middleware
    │   ├── db/                           # Async engine, session & declarative base
    │   ├── models/                       # Relational database models (Users, Portfolios, Transactions, etc.)
    │   ├── repositories/                 # Async repository persistence layer
    │   ├── schemas/                      # Pydantic v2 validation models
    │   └── services/                     # Business logic, AI context & financial engines
    ├── alembic/                          # Database schema migration versions
    └── tests/                            # Pytest test suite
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **Git**

---

### 1. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run migrations (or use SQLite async for local development)
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend API will run at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

---

## 🔧 Environment Configuration

Copy the example configuration files and adjust values:

```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base endpoint for backend API | `http://localhost:8000/api/v1` |
| `VITE_USE_MOCK_API` | Offline development toggle (`true` / `false`) | `true` |
| `DATABASE_URL` | PostgreSQL or SQLite database connection URI | `postgresql+asyncpg://...` |
| `JWT_SECRET` | Secret key for JWT token generation | Development secret |

---

## 🧪 Testing

```bash
# Run backend test suite
cd backend
pytest tests/ -v
```

---

## 🚢 Deployment

- **Frontend**: Configured for continuous deployment via [Vercel](vercel.json).
- **Backend**: Container-ready with [render.yaml](render.yaml) for cloud PaaS hosting.

---

## 📄 License

This project is licensed under the MIT License.
