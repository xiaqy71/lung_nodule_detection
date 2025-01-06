"""create account table

Revision ID: 3c09c51de3ad
Revises: 
Create Date: 2025-01-06 16:36:13.503819

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c09c51de3ad'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column()
    )


def downgrade() -> None:
    pass
