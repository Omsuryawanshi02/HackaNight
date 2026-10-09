"""Seed the database with test users and a sample project.

Run:  python scripts/seed.py

Uses async engine (asyncpg / aiosqlite) so it works natively on all platforms
without requiring psycopg2.
"""
from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure the project root is importable when run as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.models import Project, ProjectMember, User
from app.db.session import _is_supabase_pooler_url, _normalize_database_url

USERS = [
    {
        "email": "admin@siteaudit.io",
        "password": "admin1234",
        "full_name": "Site Administrator",
        "role": "ADMIN",
    },
    {
        "email": "supervisor@siteaudit.io",
        "password": "supervisor1234",
        "full_name": "Jane Supervisor",
        "role": "SITE_SUPERVISOR",
    },
    {
        "email": "store@siteaudit.io",
        "password": "store1234",
        "full_name": "Raj Store In-Charge",
        "role": "STORE_INCHARGE",
    },
    {
        "email": "auditor@siteaudit.io",
        "password": "auditor1234",
        "full_name": "Priya Auditor",
        "role": "PROJECT_AUDITOR",
    },
]


async def async_seed() -> None:
    settings = get_settings()
    url = _normalize_database_url(settings.database_url)
    connect_args = {}
    if _is_supabase_pooler_url(url):
        connect_args = {"statement_cache_size": 0}
    engine = create_async_engine(url, future=True, echo=False, connect_args=connect_args)

    import app.db.models  # noqa: F401  (registers tables)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        created_users: dict[str, User] = {}
        for spec in USERS:
            user = await session.scalar(select(User).where(User.email == spec["email"]))
            if user is None:
                user = User(
                    email=spec["email"],
                    password_hash=get_password_hash(spec["password"]),
                    full_name=spec["full_name"],
                    role=spec["role"],
                )
                session.add(user)
                await session.flush()
            created_users[spec["role"]] = user

        project = await session.scalar(select(Project).where(Project.code == "DEMO-001"))
        if project is None:
            now = datetime.now(timezone.utc)
            project = Project(
                name="Demo Construction Site",
                code="DEMO-001",
                site_lat=28.6139,
                site_lon=77.2090,
                geofence_radius_m=500.0,
                start_date=now,
                end_date=now + timedelta(days=180),
                status="ACTIVE",
            )
            session.add(project)
            await session.flush()

            role_on_project = {
                "ADMIN": "ADMIN",
                "SITE_SUPERVISOR": "SITE_SUPERVISOR",
                "STORE_INCHARGE": "STORE_INCHARGE",
                "PROJECT_AUDITOR": "PROJECT_AUDITOR",
            }
            for role, user in created_users.items():
                session.add(
                    ProjectMember(
                        project_id=project.id,
                        user_id=user.id,
                        role_on_project=role_on_project[role],
                    )
                )

        await session.commit()

    await engine.dispose()

    # If Supabase URL and service role key are configured, also ensure users exist in Supabase Auth
    if settings.supabase_url and settings.supabase_service_role_key:
        try:
            import httpx
            sb_url = settings.supabase_url.rstrip("/") + "/auth/v1/admin/users"
            sb_headers = {
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": "application/json",
            }
            print("Syncing seed users with Supabase Auth...")
            for spec in USERS:
                sb_body = {
                    "email": spec["email"],
                    "password": spec["password"],
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": spec["full_name"],
                        "role": spec["role"],
                    },
                }
                try:
                    r = httpx.post(sb_url, headers=sb_headers, json=sb_body, timeout=5.0)
                    if r.status_code in (200, 201):
                        print(f"  [Supabase] Provisioned {spec['email']}")
                    else:
                        print(f"  [Supabase] {spec['email']}: status {r.status_code}")
                except Exception as exc:
                    print(f"  [Supabase] Note: could not create {spec['email']}: {exc}")
        except ImportError:
            pass

    print("Seeded users:")
    for spec in USERS:
        print(f"  {spec['email']} ({spec['role']}) password={spec['password']}")
    print("Seeded project: DEMO-001 (Demo Construction Site)")


def seed() -> None:
    asyncio.run(async_seed())


if __name__ == "__main__":
    seed()
