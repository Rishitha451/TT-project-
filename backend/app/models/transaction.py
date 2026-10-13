"""Transaction entity model."""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now

if TYPE_CHECKING:
    from app.models.user import User


class Transaction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Financial transaction entity.
    Uses exact Decimal numeric representation (Numeric(18, 4)) to avoid floating point imprecision.
    """

    __tablename__ = "transactions"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    # Exact numeric precision: up to 14 integer digits, 4 fractional digits
    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=4, asdecimal=True),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,  # 'credit' | 'debit'
    )
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="completed",
        nullable=False,  # 'completed' | 'pending' | 'failed'
    )
    account_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="transactions",
    )

    __table_args__ = (
        Index("ix_transactions_user_id_date", "user_id", "date"),
        Index("ix_transactions_user_id_category", "user_id", "category"),
    )

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, title={self.title}, amount={self.amount}, type={self.type})>"
