"""Unit tests for Supabase Auth integration."""
from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings
from app.core.supabase import (
    get_supabase_headers,
    get_supabase_url,
    sync_supabase_user,
    verify_supabase_token,
)
from app.db.base import Base
from app.db.models import User


@pytest.fixture
async def async_db():
    """In-memory async SQLite database session for unit tests."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

    await engine.dispose()


def test_supabase_config_helpers():
    with patch("app.core.supabase.get_settings") as mock_settings:
        mock_settings.return_value = Settings(
            DATABASE_URL="sqlite+aiosqlite:///./dev.db",
            SUPABASE_URL="https://testproject.supabase.co/",
            SUPABASE_ANON_KEY="test-anon-key",
            SUPABASE_SERVICE_ROLE_KEY="test-service-key",
        )
        assert get_supabase_url() == "https://testproject.supabase.co"

        headers = get_supabase_headers()
        assert headers["apikey"] == "test-anon-key"
        assert headers["Content-Type"] == "application/json"

        admin_headers = get_supabase_headers(use_service_role=True)
        assert admin_headers["apikey"] == "test-service-key"
        assert admin_headers["Authorization"] == "Bearer test-service-key"

        user_headers = get_supabase_headers(bearer_token="user-token")
        assert user_headers["Authorization"] == "Bearer user-token"


@pytest.mark.asyncio
async def test_verify_supabase_token_local_secret():
    secret = "supabase-test-jwt-secret-12345"
    uid = str(uuid.uuid4())
    token = jwt.encode(
        {
            "sub": uid,
            "email": "supervisor@siteaudit.io",
            "user_metadata": {"full_name": "Test Supervisor", "role": "SITE_SUPERVISOR"},
        },
        secret,
        algorithm="HS256",
    )

    with patch("app.core.supabase.get_settings") as mock_settings:
        mock_settings.return_value = Settings(
            DATABASE_URL="sqlite+aiosqlite:///./dev.db",
            SUPABASE_JWT_SECRET=secret,
        )
        result = await verify_supabase_token(token)
        assert result["id"] == uid
        assert result["email"] == "supervisor@siteaudit.io"
        assert result["role"] == "SITE_SUPERVISOR"
        assert result["full_name"] == "Test Supervisor"


@pytest.mark.asyncio
async def test_verify_supabase_token_invalid():
    with patch("app.core.supabase.get_settings") as mock_settings:
        mock_settings.return_value = Settings(
            DATABASE_URL="sqlite+aiosqlite:///./dev.db",
            SUPABASE_JWT_SECRET="correct-secret",
            SUPABASE_URL="",
        )
        with pytest.raises(HTTPException) as exc_info:
            await verify_supabase_token("invalid.token.here")
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_sync_supabase_user_creates_new_user(async_db: AsyncSession):
    uid = uuid.uuid4()
    sb_data = {
        "id": str(uid),
        "email": "newuser@siteaudit.io",
        "user_metadata": {
            "full_name": "New User",
            "role": "PROJECT_AUDITOR",
        },
    }

    user = await sync_supabase_user(async_db, sb_data)
    assert user.id == uid
    assert user.email == "newuser@siteaudit.io"
    assert user.role == "PROJECT_AUDITOR"
    assert user.full_name == "New User"
    assert user.is_active is True

    # Verify present in DB
    persisted = await async_db.scalar(select(User).where(User.id == uid))
    assert persisted is not None
    assert persisted.email == "newuser@siteaudit.io"


@pytest.mark.asyncio
async def test_sync_supabase_user_updates_existing_user(async_db: AsyncSession):
    uid = uuid.uuid4()
    existing = User(
        id=uid,
        email="existing@siteaudit.io",
        full_name="Old Name",
        role="SITE_SUPERVISOR",
        is_active=True,
    )
    async_db.add(existing)
    await async_db.commit()

    sb_data = {
        "id": str(uid),
        "email": "existing@siteaudit.io",
        "user_metadata": {
            "full_name": "Updated Name",
            "role": "ADMIN",
        },
    }

    updated = await sync_supabase_user(async_db, sb_data)
    assert updated.id == uid
    assert updated.full_name == "Updated Name"
    assert updated.role == "ADMIN"
