"""Seed the database with test users and a sample project.

Run:  python scripts/seed.py

Uses a synchronous engine (async driver URLs are translated to
their sync equivalents) so it can run as a plain script.
"""
from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure the project root is importable when run as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.models import Project, ProjectMember, User


def _to_sync_url(url: str) -> str:
    return url.replace("+aiosqlite", "").replace("+asyncpg", "+psycopg2")


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


def seed() -> None:
    settings = get_settings()
    url = _to_sync_url(settings.database_url)
    engine = create_engine(url, future=True)

    import app.db.models  # noqa: F401  (registers tables)

    Base.metadata.create_all(engine)

    with Session(engine, expire_on_commit=False) as session:
        created_users: dict[str, User] = {}
        for spec in USERS:
            user = session.scalar(select(User).where(User.email == spec["email"]))
            if user is None:
                user = User(
                    email=spec["email"],
                    password_hash=get_password_hash(spec["password"]),
                    full_name=spec["full_name"],
                    role=spec["role"],
                )
                session.add(user)
                session.flush()
            created_users[spec["role"]] = user

        project = session.scalar(select(Project).where(Project.code == "DEMO-001"))
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
            session.flush()

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

        session.commit()

    engine.dispose()

    # If Supabase URL and service role key are configured, also ensure users exist in Supabase
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


if __name__ == "__main__":
    seed()

