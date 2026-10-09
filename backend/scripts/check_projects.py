"""Check the raw GET /api/v1/projects/ response shape."""
from __future__ import annotations

import time

import httpx

BASE = "http://127.0.0.1:8000"


def main() -> None:
    with httpx.Client() as client:
        r = client.post(
            f"{BASE}/api/v1/auth/login",
            json={"email": "admin@siteaudit.io", "password": "admin1234"},
        )
        print("login:", r.status_code)
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        r = client.get(f"{BASE}/api/v1/projects/", headers=headers)
        print("GET /projects/ status:", r.status_code)
        print("raw body:", r.text[:600])

        r = client.get(f"{BASE}/api/v1/auth/me", headers=headers)
        print("GET /auth/me status:", r.status_code)
        print("me:", r.text[:300])


if __name__ == "__main__":
    main()
