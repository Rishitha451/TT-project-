"""User profile and application preferences service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.settings import UserSettings
from app.models.user import User
from app.repositories.settings_repository import SettingsRepository
from app.repositories.user_repository import UserRepository
from app.schemas.settings import (
    UserPreferencesRead,
    UserPreferencesUpdate,
    UserProfileRead,
    UserProfileUpdate,
    UserSettingsRead,
    UserSettingsUpdate,
)


class SettingsService:
    """Service handling profile updates and typed user preferences."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_repo = UserRepository(db)
        self.settings_repo = SettingsRepository(db)

    async def _get_or_create_settings(self, user: User) -> UserSettings:
        """Fetch existing user settings or create defaults atomically."""
        settings = await self.settings_repo.get_by_user_id(user.id)
        if not settings:
            settings = UserSettings(
                user_id=user.id,
                currency=user.currency or "INR",
                theme="dark",
                email_alerts=True,
                push_notifications=True,
                weekly_digest=True,
                investment_alerts=True,
            )
            settings = await self.settings_repo.create(settings)
            await self.db.commit()
            await self.db.refresh(settings)
        return settings

    async def get_user_settings(self, user: User) -> UserSettingsRead:
        """Fetch combined UserSettings (profile + preferences)."""
        settings = await self._get_or_create_settings(user)
        profile = UserProfileRead(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=settings.phone,
            bio=settings.bio,
        )
        preferences = UserPreferencesRead(
            currency=settings.currency,
            theme=settings.theme,
            email_alerts=settings.email_alerts,
            push_notifications=settings.push_notifications,
            weekly_digest=settings.weekly_digest,
            investment_alerts=settings.investment_alerts,
        )
        return UserSettingsRead(profile=profile, preferences=preferences)

    async def update_profile(self, user: User, payload: UserProfileUpdate) -> UserProfileRead:
        """Update user profile fields."""
        settings = await self._get_or_create_settings(user)

        if payload.name is not None:
            user.name = payload.name.strip()
        if payload.avatar_url is not None:
            user.avatar_url = payload.avatar_url

        if payload.phone is not None:
            settings.phone = payload.phone
        if payload.bio is not None:
            settings.bio = payload.bio

        await self.user_repo.update(user)
        await self.settings_repo.update(settings)
        await self.db.commit()
        await self.db.refresh(user)
        await self.db.refresh(settings)

        return UserProfileRead(
            id=user.id,
            name=user.name,
            email=user.email,
            phone=settings.phone,
            bio=settings.bio,
        )

    async def update_preferences(self, user: User, payload: UserPreferencesUpdate) -> UserPreferencesRead:
        """Update user application preferences."""
        settings = await self._get_or_create_settings(user)

        if payload.currency is not None:
            settings.currency = payload.currency
            user.currency = payload.currency
            await self.user_repo.update(user)

        if payload.theme is not None:
            settings.theme = payload.theme
        if payload.email_alerts is not None:
            settings.email_alerts = payload.email_alerts
        if payload.push_notifications is not None:
            settings.push_notifications = payload.push_notifications
        if payload.weekly_digest is not None:
            settings.weekly_digest = payload.weekly_digest
        if payload.investment_alerts is not None:
            settings.investment_alerts = payload.investment_alerts

        await self.settings_repo.update(settings)
        await self.db.commit()
        await self.db.refresh(settings)

        return UserPreferencesRead(
            currency=settings.currency,
            theme=settings.theme,
            email_alerts=settings.email_alerts,
            push_notifications=settings.push_notifications,
            weekly_digest=settings.weekly_digest,
            investment_alerts=settings.investment_alerts,
        )

    async def update_settings(self, user: User, payload: UserSettingsUpdate) -> UserSettingsRead:
        """Update unified settings object."""
        if payload.profile:
            await self.update_profile(user, payload.profile)
        if payload.preferences:
            await self.update_preferences(user, payload.preferences)
        return await self.get_user_settings(user)
