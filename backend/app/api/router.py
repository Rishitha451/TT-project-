from fastapi import APIRouter
from .v1 import (
    health,
    auth,
    dashboard,
    transactions,
    goals,
    analytics,
    reports,
    notifications,
    settings,
    investments,
    advisor,
    financial_profile,
)

api_v1_router = APIRouter(prefix="/api/v1")

# Register all v1 domain routers
api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(transactions.router)
api_v1_router.include_router(goals.router)
api_v1_router.include_router(analytics.router)
api_v1_router.include_router(reports.router)
api_v1_router.include_router(notifications.router)
api_v1_router.include_router(settings.router)
api_v1_router.include_router(investments.router)
api_v1_router.include_router(advisor.router)
api_v1_router.include_router(financial_profile.router)
