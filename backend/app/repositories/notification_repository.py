"""Notification repository for user-scoped persistence operations."""

from typing import Optional, Sequence
from sqlalchemy import and_, delete, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Repository handling user-scoped Notification persistence."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Notification, session)

    async def get_by_id_for_user(self, notification_id: str, user_id: str) -> Optional[Notification]:
        """Fetch notification by ID enforcing user ownership."""
        query = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
    ) -> Sequence[Notification]:
        """Fetch notifications for a user, newest first."""
        query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            query = query.where(Notification.is_read.is_(False))
        query = query.order_by(desc(Notification.created_at)).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def mark_as_read(self, notification_id: str, user_id: str) -> Optional[Notification]:
        """Mark a single user-owned notification as read."""
        notif = await self.get_by_id_for_user(notification_id, user_id)
        if notif and not notif.is_read:
            notif.is_read = True
            await self.session.flush()
            await self.session.refresh(notif)
        return notif

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all unread notifications for a user as read."""
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount  # type: ignore[return-value]

    async def clear_all_for_user(self, user_id: str) -> int:
        """Delete all notifications for a user."""
        stmt = delete(Notification).where(Notification.user_id == user_id)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount  # type: ignore[return-value]
