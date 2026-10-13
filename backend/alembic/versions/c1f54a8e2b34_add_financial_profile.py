"""add_financial_profile

Revision ID: c1f54a8e2b34
Revises: 9b3e12a45c67
Create Date: 2026-10-08 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f54a8e2b34'
down_revision: Union[str, Sequence[str], None] = '9b3e12a45c67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create financial_profiles table."""
    op.create_table(
        'financial_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='INR'),
        sa.Column('employment_status', sa.String(length=100), nullable=True),
        sa.Column('monthly_income', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('additional_income', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('income_sources', sa.JSON(), nullable=True),
        sa.Column('monthly_expenses', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('expense_categories', sa.JSON(), nullable=True),
        sa.Column('savings', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('cash_balance', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('emergency_fund', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('total_assets', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('asset_breakdown', sa.JSON(), nullable=True),
        sa.Column('total_investments', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('investment_breakdown', sa.JSON(), nullable=True),
        sa.Column('total_debt', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('debt_breakdown', sa.JSON(), nullable=True),
        sa.Column('risk_profile', sa.String(length=50), nullable=False, server_default='Moderate'),
        sa.Column('risk_score', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_financial_profiles_user_id_users'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_financial_profiles')),
        sa.UniqueConstraint('user_id', name=op.f('uq_financial_profiles_user_id')),
    )
    op.create_index(op.f('ix_financial_profiles_user_id'), 'financial_profiles', ['user_id'], unique=True)


def downgrade() -> None:
    """Drop financial_profiles table."""
    op.drop_index(op.f('ix_financial_profiles_user_id'), table_name='financial_profiles')
    op.drop_table('financial_profiles')
