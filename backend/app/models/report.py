"""Financial report metadata model."""

from typing import TYPE_CHECKING, Optional
from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class FinancialReport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Generated / scheduled financial report record.
    """

    __tablename__ = "financial_reports"

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
    period: Mapped[str] = mapped_column(
        String(50),
        nullable=False,  # e.g., 'Q1 2026', 'March 2026'
    )
    report_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,  # 'summary' | 'tax' | 'spending' | 'portfolio'
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="Ready",
        nullable=False,  # 'Ready' | 'Processing' | 'Failed'
    )
    file_size: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    download_url: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="reports",
    )

    __table_args__ = (
        Index("ix_financial_reports_user_id_created_at", "user_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<FinancialReport(id={self.id}, name={self.name}, status={self.status})>"
