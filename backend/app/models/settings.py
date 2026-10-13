"""User profile and preferences / settings model."""

from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserSettings(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Persistent user settings entity.
    Encapsulates both profile metadata and typed application preferences.
    """

    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Profile fields
    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    bio: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Preference fields
    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False,  # 'INR' | 'USD' | 'EUR' | 'GBP'
    )
    theme: Mapped[str] = mapped_column(
        String(20),
        default="dark",
        nullable=False,  # 'light' | 'dark' | 'system'
    )
    email_alerts: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    push_notifications: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    weekly_digest: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    investment_alerts: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="settings",
    )

    def __repr__(self) -> str:
        return f"<UserSettings(id={self.id}, user_id={self.user_id}, currency={self.currency}, theme={self.theme})>"
