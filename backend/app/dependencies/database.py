"""Database session dependency for FastAPI routes."""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an active async database session.
    Automatically handles transaction lifecycle and cleanup.
    """
    async for session in get_db_session():
        yield session
