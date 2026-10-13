"""Notification business service layer."""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationRead


class NotificationService:
    """Service handling user in-app notifications and alerts."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = NotificationRepository(db)

    def _to_read_schema(self, notif: Notification) -> NotificationRead:
        """Convert Notification model to NotificationRead schema matching frontend contract."""
        time_str = notif.created_at.strftime("%b %d, %H:%M")
        return NotificationRead(
            id=notif.id,
            user_id=notif.user_id,
            title=notif.title,
            message=notif.message,
            time=time_str,
            read=notif.is_read,
            type=notif.type,
            link=notif.link,
            created_at=notif.created_at,
            updated_at=notif.updated_at,
        )

    async def list_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
    ) -> List[NotificationRead]:
        """Fetch all notifications for authenticated user, newest first."""
        items = await self.repo.get_by_user(user_id=user_id, unread_only=unread_only, limit=limit)
        return [self._to_read_schema(n) for n in items]

    async def mark_as_read(self, notification_id: str, user_id: str) -> NotificationRead:
        """Mark single notification as read ensuring user ownership."""
        notif = await self.repo.get_by_id_for_user(notification_id, user_id)
        if not notif:
            raise NotFoundException(
                message=f"Notification with ID '{notification_id}' was not found.",
            )
        updated = await self.repo.mark_as_read(notification_id, user_id)
        await self.db.commit()
        await self.db.refresh(updated)
        return self._to_read_schema(updated)

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all unread notifications for a user as read."""
        count = await self.repo.mark_all_as_read(user_id)
        await self.db.commit()
        return count

    async def clear_all(self, user_id: str) -> int:
        """Delete all notifications for a user."""
        count = await self.repo.clear_all_for_user(user_id)
        await self.db.commit()
        return count

    async def delete_notification(self, notification_id: str, user_id: str) -> str:
        """Delete a single notification ensuring user ownership."""
        notif = await self.repo.get_by_id_for_user(notification_id, user_id)
        if not notif:
            raise NotFoundException(
                message=f"Notification with ID '{notification_id}' was not found.",
            )
        await self.repo.delete(notif)
        await self.db.commit()
        return notification_id
