"""add_user_password_hash

Revision ID: 9b3e12a45c67
Revises: 48751d212df0
Create Date: 2026-10-07 18:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b3e12a45c67'
down_revision: Union[str, Sequence[str], None] = '48751d212df0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add password_hash column to users table."""
    op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=False, server_default=''))


def downgrade() -> None:
    """Remove password_hash column from users table."""
    op.drop_column('users', 'password_hash')
