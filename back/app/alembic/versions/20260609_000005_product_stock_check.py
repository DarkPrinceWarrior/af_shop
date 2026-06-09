"""Add non-negative stock check constraint to product

Revision ID: 20260609_000005
Revises: 20260609_000004
Create Date: 2026-06-09 00:00:05.000000

"""
from alembic import op


revision = "20260609_000005"
down_revision = "20260609_000004"
branch_labels = None
depends_on = None


def upgrade():
    op.create_check_constraint(
        "ck_product_stock_non_negative", "product", "stock_quantity >= 0"
    )


def downgrade():
    op.drop_constraint(
        "ck_product_stock_non_negative", "product", type_="check"
    )
