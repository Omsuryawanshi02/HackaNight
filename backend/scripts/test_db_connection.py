"""Test database connection to Supabase and diagnose IPv4/IPv6 / pooler."""
from __future__ import annotations

import asyncio
import socket
import sys
from pathlib import Path

# Ensure root is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
from app.db.session import _normalize_database_url
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def test_connection() -> None:
    settings = get_settings()
    url = _normalize_database_url(settings.database_url)
    print(f"Testing configured DATABASE_URL: {url.split('@')[-1]}")

    # 1. Test DNS resolution
    try:
        host = url.split("@")[-1].split(":")[0].split("/")[0]
        print(f"Resolving host: {host} ...")
        addr_info = socket.getaddrinfo(host, 5432)
        print(f"  [OK] Resolved {host} -> {[a[4][0] for a in addr_info]}")
    except socket.gaierror as e:
        print(f"  [FAIL] DNS Resolution failed for {host}: {e}")
        print("\nNote: 'db.xxx.supabase.co' uses IPv6 only.")
        print("If your network does not support IPv6, you must use Supabase's Connection Pooler (IPv4).")
        print("\nChecking common Supabase pooler hosts:")
        candidates = [
            "aws-0-ap-south-1.pooler.supabase.com",      # Mumbai (India)
            "aws-0-ap-southeast-1.pooler.supabase.com",  # Singapore
            "aws-0-us-east-1.pooler.supabase.com",       # N. Virginia
            "aws-0-eu-central-1.pooler.supabase.com",    # Frankfurt
        ]
        for c in candidates:
            try:
                c_addr = socket.getaddrinfo(c, 65432)
                print(f"  -> {c} is REACHABLE over IPv4 ({c_addr[0][4][0]})")
            except Exception:
                pass
        return

    # 2. Test database connection
    try:
        engine = create_async_engine(url, echo=False)
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT version();"))
            row = res.scalar()
            print(f"\n[SUCCESS] Connected to PostgreSQL!\nVersion: {row}")
        await engine.dispose()
    except Exception as exc:
        print(f"\n[FAIL] Connection failed: {exc}")


if __name__ == "__main__":
    asyncio.run(test_connection())
