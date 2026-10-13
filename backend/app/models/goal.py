"""Financial goal entity model."""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class Goal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Financial goal entity for savings and budget tracking.
    Uses exact Decimal numeric representation (Numeric(18, 4)) for target and current amounts.
    """

    __tablename__ = "goals"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    target_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        nullable=False,
    )
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        default=Decimal("0.0000"),
        nullable=False,
    )
    color: Mapped[str] = mapped_column(
        String(50),
        default="#3B82F6",
        nullable=False,
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    target_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="in_progress",
        nullable=False,  # 'in_progress' | 'completed' | 'archived'
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="goals",
    )

    __table_args__ = (
        Index("ix_goals_user_id_status", "user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Goal(id={self.id}, name={self.name}, target={self.target_amount}, current={self.current_amount})>"
