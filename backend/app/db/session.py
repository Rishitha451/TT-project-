"""
Database connection, engine configuration, and async session factory.
Supports async PostgreSQL (production) and async SQLite (isolated tests & lightweight dev).
"""

from collections.abc import AsyncGenerator
import logging
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

logger = logging.getLogger("ai_finance_advisor.db")

# Build engine arguments
engine_kwargs: dict[str, Any] = {
    "echo": settings.DEBUG and settings.APP_ENV == "development",
    "future": True,
}

# Apply pool settings for non-sqlite production databases
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update(
        {
            "pool_size": 10,
            "max_overflow": 20,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
        }
    )

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs,
)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency generator that yields an isolated AsyncSession.
    Ensures rollback on error and proper session closure.
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def close_db_engine() -> None:
    """Dispose the engine connection pool during application shutdown."""
    logger.info("Disposing database connection pool...")
    await engine.dispose()
    logger.info("Database connection pool disposed.")
