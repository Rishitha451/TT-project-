"""
SQLAlchemy 2.x Declarative Base and metadata configuration.
Includes standard naming conventions for constraints and indexes to ensure consistent Alembic migrations.
"""

from datetime import datetime, timezone
from typing import Any
import uuid

from sqlalchemy import DateTime, MetaData, String
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column

# Explicit naming convention for constraints and indexes
POSTGRES_INDEX_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


def utc_now() -> datetime:
    """Return current UTC timestamp with timezone."""
    return datetime.now(timezone.utc)


def generate_uuid_str() -> str:
    """Generate a UUID4 hex string."""
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy models."""

    metadata = MetaData(naming_convention=POSTGRES_INDEX_NAMING_CONVENTION)

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """Default table name is snake_case of model class name."""
        import re

        name = cls.__name__
        return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower() + "s"


class TimestampMixin:
    """Reusable mixin providing created_at and updated_at timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


class UUIDPrimaryKeyMixin:
    """Reusable mixin providing a string UUID primary key."""

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid_str,
        nullable=False,
    )
