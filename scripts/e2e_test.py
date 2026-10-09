"""End-to-end API test against a running server.

Run after:  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
and:        python scripts/seed.py
"""
from __future__ import annotations

import sys
import time

import httpx

BASE = "http://127.0.0.1:8000"
ADMIN = "admin@siteaudit.io"
ADMIN_PASS = "admin1234"
SUPERVISOR = "supervisor@siteaudit.io"
SUPERVISOR_PASS = "supervisor1234"


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


def login(client: httpx.Client, email: str, password: str) -> str:
    r = client.post(
        f"{BASE}/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def main() -> int:
    wait_for_server()
    failures: list[str] = []

    with httpx.Client() as client:
        # 1. Admin login
        admin_token = login(client, ADMIN, ADMIN_PASS)
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("[ok] admin login")

        # 2. /auth/me
        me = client.get(f"{BASE}/api/v1/auth/me", headers=admin_headers)
        assert me.status_code == 200, f"me failed: {me.status_code} {me.text}"
        assert me.json()["role"] == "ADMIN", me.json()
        print("[ok] GET /auth/me returns ADMIN")

        # 3. List projects as admin (should include DEMO-001)
        listed = client.get(f"{BASE}/api/v1/projects/", headers=admin_headers)
        assert listed.status_code == 200, f"list failed: {listed.text}"
        codes = [p["code"] for p in listed.json()["items"]]
        assert "DEMO-001" in codes, codes
        print(f"[ok] GET /projects/ -> {codes}")

        # 4. Admin creates a second project
        created = client.post(
            f"{BASE}/api/v1/projects/",
            headers=admin_headers,
            json={
                "name": "Second Site",
                "code": "SITE-002",
                "geofence_radius_m": 300.0,
                "start_date": "2026-01-01T00:00:00Z",
            },
        )
        assert created.status_code == 201, f"create failed: {created.text}"
        project_b_id = created.json()["id"]
        print(f"[ok] POST /projects/ -> SITE-002 ({project_b_id})")

        # 5. IDOR: supervisor (not a member of SITE-002) cannot read it
        sup_token = login(client, SUPERVISOR, SUPERVISOR_PASS)
        sup_headers = {"Authorization": f"Bearer {sup_token}"}
        denied = client.get(
            f"{BASE}/api/v1/projects/{project_b_id}", headers=sup_headers
        )
        assert denied.status_code == 403, (
            f"IDOR not blocked: {denied.status_code} {denied.text}"
        )
        print("[ok] IDOR blocked: supervisor cannot read SITE-002 (403)")

        # 6. Supervisor CAN read DEMO-001 (they are a member)
        listed_sup = client.get(
            f"{BASE}/api/v1/projects/", headers=sup_headers
        )
        assert listed_sup.status_code == 200, listed_sup.text
        sup_codes = [p["code"] for p in listed_sup.json()["items"]]
        assert "DEMO-001" in sup_codes, sup_codes
        assert "SITE-002" not in sup_codes, sup_codes
        print(f"[ok] supervisor sees only their projects: {sup_codes}")

        # 7. RBAC: supervisor may NOT create a project (admin-only)
        denied_create = client.post(
            f"{BASE}/api/v1/projects/",
            headers=sup_headers,
            json={
                "name": "Unauthorized",
                "code": "NOPE-001",
                "start_date": "2026-01-01T00:00:00Z",
            },
        )
        assert denied_create.status_code == 403, (
            f"supervisor created project: {denied_create.status_code}"
        )
        print("[ok] RBAC: supervisor cannot create projects (403)")

        # 8. Unauthenticated request is rejected
        anon = client.get(f"{BASE}/api/v1/projects/")
        assert anon.status_code == 401, anon.status_code
        print("[ok] unauthenticated GET /projects/ -> 401")

    print("\nRESULT: ALL E2E CHECKS PASSED" if not failures else "\nRESULT: FAIL")
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
