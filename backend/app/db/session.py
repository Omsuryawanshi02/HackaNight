from __future__ import annotations

from typing import AsyncGenerator
from urllib.parse import urlsplit

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import get_engine, set_engine

# Lazily-created sessionmaker; bound to the engine on first use.
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _normalize_database_url(url: str) -> str:
    """Ensure PostgreSQL URLs use the asyncpg async driver."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def _is_supabase_url(url: str) -> bool:
    """Return True when the URL host belongs to Supabase."""
    hostname = (urlsplit(url).hostname or "").lower()
    return "supabase" in hostname


def _is_supabase_pooler_url(url: str) -> bool:
    """Return True when the URL host is a Supabase pooler domain."""
    hostname = (urlsplit(url).hostname or "").lower()
    return hostname == "pooler.supabase.com" or hostname.endswith(".pooler.supabase.com")


def init_db(database_url: str) -> None:
    """Initialize the database engine and session factory."""
    norm_url = _normalize_database_url(database_url)
    connect_args = {}
    if _is_supabase_url(norm_url):
        connect_args["ssl"] = "require"
    if _is_supabase_pooler_url(norm_url):
        connect_args["statement_cache_size"] = 0

    engine_kwargs = {
        "echo": False,
        "future": True,
        "connect_args": connect_args,
    }

    if "sqlite" in norm_url:
        # SQLite does not support standard PostgreSQL pool size options
        pass
    else:
        engine_kwargs.update({
            "pool_size": 3,
            "max_overflow": 2,
            "pool_recycle": 300,
            "pool_pre_ping": True,
        })

    engine = create_async_engine(norm_url, **engine_kwargs)
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
