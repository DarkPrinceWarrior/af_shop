"""Add telegram settings table

Revision ID: 20260609_000004
Revises: 20260503_000003
Create Date: 2026-06-09 00:00:04.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "20260609_000004"
down_revision = "20260503_000003"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "telegram_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bot_token", sa.String(length=255), nullable=True),
        sa.Column("owner_chat_id", sa.String(length=64), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("telegram_settings")
