"""Goal business service layer."""

from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.goal import Goal
from app.repositories.goal_repository import GoalRepository
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate


class GoalService:
    """Service handling Goal business logic and progress calculations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = GoalRepository(db)

    @staticmethod
    def _calculate_progress(current: Decimal, target: Decimal) -> float:
        """Safely calculate progress ratio (0.0 to 1.0+)."""
        if target <= Decimal("0"):
            return 0.0
        return float(current / target)

    def _to_read_schema(self, goal: Goal) -> GoalRead:
        """Convert SQLAlchemy Goal model to GoalRead schema with progress metric."""
        target_val = goal.target_amount
        current_val = goal.current_amount
        progress_val = self._calculate_progress(current_val, target_val)

        return GoalRead(
            id=goal.id,
            user_id=goal.user_id,
            name=goal.name,
            target=target_val,
            current=current_val,
            color=goal.color,
            category=goal.category,
            target_date=goal.target_date,
            status=goal.status,
            progress=progress_val,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
        )

    async def list_goals(
        self,
        user_id: str,
        status: Optional[str] = None,
    ) -> List[GoalRead]:
        """Fetch all goals belonging to authenticated user."""
        goals = await self.repo.get_by_user(user_id=user_id, status=status)
        return [self._to_read_schema(g) for g in goals]

    async def get_goal(self, goal_id: str, user_id: str) -> GoalRead:
        """Fetch single goal ensuring user ownership."""
        goal = await self.repo.get_by_id_for_user(goal_id, user_id)
        if not goal:
            raise NotFoundException(
                message=f"Financial goal with ID '{goal_id}' was not found.",
            )
        return self._to_read_schema(goal)

    async def create_goal(
        self,
        payload: GoalCreate,
        user_id: str,
    ) -> GoalRead:
        """Create and persist a new financial goal."""
        target_val = payload.target if payload.target is not None else payload.target_amount
        if target_val is None or target_val <= Decimal("0"):
            target_val = Decimal("1000.0000")

        current_val = payload.current if payload.current is not None else payload.current_amount
        if current_val is None or current_val < Decimal("0"):
            current_val = Decimal("0.0000")

        goal = Goal(
            user_id=user_id,
            name=payload.name.strip(),
            target_amount=target_val,
            current_amount=current_val,
            color=payload.color or "#3B82F6",
            category=payload.category,
            target_date=payload.target_date,
            status=payload.status or "in_progress",
        )
        created = await self.repo.create(goal)
        await self.db.commit()
        await self.db.refresh(created)
        return self._to_read_schema(created)

    async def update_goal(
        self,
        goal_id: str,
        payload: GoalUpdate,
        user_id: str,
    ) -> GoalRead:
        """Update goal fields ensuring user ownership."""
        goal = await self.repo.get_by_id_for_user(goal_id, user_id)
        if not goal:
            raise NotFoundException(
                message=f"Financial goal with ID '{goal_id}' was not found.",
            )

        if payload.name is not None:
            goal.name = payload.name.strip()

        target_val = payload.target if payload.target is not None else payload.target_amount
        if target_val is not None:
            goal.target_amount = target_val

        current_val = payload.current if payload.current is not None else payload.current_amount
        if current_val is not None:
            goal.current_amount = current_val

        if payload.color is not None:
            goal.color = payload.color
        if payload.category is not None:
            goal.category = payload.category
        if payload.target_date is not None:
            goal.target_date = payload.target_date
        if payload.status is not None:
            goal.status = payload.status

        updated = await self.repo.update(goal)
        await self.db.commit()
        await self.db.refresh(updated)
        return self._to_read_schema(updated)

    async def delete_goal(self, goal_id: str, user_id: str) -> str:
        """Delete goal ensuring user ownership."""
        goal = await self.repo.get_by_id_for_user(goal_id, user_id)
        if not goal:
            raise NotFoundException(
                message=f"Financial goal with ID '{goal_id}' was not found.",
            )

        await self.repo.delete(goal)
        await self.db.commit()
        return goal_id
