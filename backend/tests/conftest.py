from collections.abc import AsyncGenerator
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool, StaticPool

from app.db.base import Base
from app.dependencies.database import get_db
from app.main import create_application

# Support environment-driven database for testing (dedicated TEST_DATABASE_URL or in-memory SQLite)
ENV_DB_URL = os.environ.get("TEST_DATABASE_URL")
if ENV_DB_URL and ("postgresql" in ENV_DB_URL or "postgres" in ENV_DB_URL):
    TEST_DATABASE_URL = ENV_DB_URL
    engine_kwargs = {"future": True, "poolclass": NullPool}
else:
    TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    engine_kwargs = {
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool,
    }

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    **engine_kwargs,
)

test_async_session_maker = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def app():
    """Create and configure a fresh FastAPI test application instance."""
    app_instance = create_application()

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_async_session_maker() as session:
            yield session

    app_instance.dependency_overrides[get_db] = override_get_db
    return app_instance


@pytest.fixture(scope="session")
def client(app):
    """Create a TestClient instance for testing endpoints."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a clean test database session with tables created and dropped per test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_async_session_maker() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
