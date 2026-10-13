"""Goal repository for user-scoped persistence operations."""

from typing import Optional, Sequence
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.goal import Goal
from app.repositories.base import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    """Repository handling user-scoped Goal persistence."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Goal, session)

    async def get_by_id_for_user(self, goal_id: str, user_id: str) -> Optional[Goal]:
        """Fetch goal by ID enforcing user ownership."""
        query = select(Goal).where(and_(Goal.id == goal_id, Goal.user_id == user_id))
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: str,
        status: Optional[str] = None,
    ) -> Sequence[Goal]:
        """Fetch all goals for a user with optional status filter."""
        query = select(Goal).where(Goal.user_id == user_id)
        if status:
            query = query.where(Goal.status == status)
        result = await self.session.execute(query)
        return result.scalars().all()
