from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import declarative_base

# Naming conventions give constraints predictable names so that
# Alembic autogenerate can render clean CREATE/DROP directives.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

Base = declarative_base(metadata=MetaData(naming_convention=NAMING_CONVENTION))


class _DBSettings:
    """Internal helper to hold the async engine until it is configured."""

    def __init__(self):
        self._engine: AsyncEngine | None = None


db_settings = _DBSettings()


def set_engine(engine: AsyncEngine) -> None:
    """Set the async engine after configuration is loaded."""
    db_settings._engine = engine


def get_engine() -> AsyncEngine:
    """Return the configured async engine, or raise if not yet configured."""
    if db_settings._engine is None:
        raise RuntimeError(
            "Database engine not configured. Call set_engine() during app startup."
        )
    return db_settings._engine
