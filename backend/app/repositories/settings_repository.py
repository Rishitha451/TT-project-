"""Settings repository for user profile and preferences persistence."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import UserSettings
from app.repositories.base import BaseRepository


class SettingsRepository(BaseRepository[UserSettings]):
    """Repository handling UserSettings persistence."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(UserSettings, session)

    async def get_by_user_id(self, user_id: str) -> Optional[UserSettings]:
        """Fetch settings record by user ID."""
        query = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
