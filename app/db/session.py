from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import get_engine, set_engine

# Lazily-created sessionmaker; bound to the engine on first use.
_session_factory: async_sessionmaker[AsyncSession] | None = None


def init_db(database_url: str) -> None:
    """Initialize the database engine and session factory."""
    engine = create_async_engine(database_url, echo=False, future=True)
    set_engine(engine)
    global _session_factory
    _session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async DB session."""
    if _session_factory is None:
        raise RuntimeError("Database not initialized. Call init_db() during startup.")
    async with _session_factory() as session:
        yield session


async def close_db() -> None:
    """Dispose the engine connection pool."""
    engine = get_engine()
    await engine.dispose()
