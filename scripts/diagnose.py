"""Diagnose auth header handling and route availability."""
from __future__ import annotations

import sys
import time

import httpx

BASE = "http://127.0.0.1:8000"


def wait_for_server(timeout: float = 30.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = httpx.get(f"{BASE}/health", timeout=2.0)
            if r.status_code == 200:
                return
        except httpx.HTTPError:
            pass
        time.sleep(0.5)
    raise RuntimeError("Server did not become healthy in time")


def main() -> int:
    wait_for_server()
    with httpx.Client() as client:
        # 1. Root route (the reported 404)
        r = client.get(f"{BASE}/")
        print(f"GET  /                      -> {r.status_code}")

        # 2. Login to get a token
        r = client.post(
            f"{BASE}/api/v1/auth/login",
            json={"email": "admin@siteaudit.io", "password": "admin1234"},
        )
        print(f"POST /api/v1/auth/login   -> {r.status_code}")
        if r.status_code != 200:
            print("  login failed, aborting")
            return 1
        token = r.json()["access_token"]

        # 3. /auth/me WITH the Authorization header
        r = client.get(
            f"{BASE}/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        print(f"GET  /auth/me (header)    -> {r.status_code}")
        if r.status_code != 200:
            print(f"  body: {r.text[:200]}")

        # 4. /auth/me with token as a QUERY param named 'authorization'
        r = client.get(
            f"{BASE}/api/v1/auth/me",
            params={"authorization": f"Bearer {token}"},
        )
        print(f"GET  /auth/me (query)     -> {r.status_code}")

        # 5. /auth/me with NO credential
        r = client.get(f"{BASE}/api/v1/auth/me")
        print(f"GET  /auth/me (none)      -> {r.status_code}")

        # 6. List registered routes
        spec = client.get(f"{BASE}/openapi.json").json()
        print(f"\nRegistered paths ({len(spec['paths'])}):")
        for p in sorted(spec["paths"]):
            print(f"  {p}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
