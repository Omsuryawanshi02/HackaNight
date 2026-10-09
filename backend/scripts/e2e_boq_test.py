"""End-to-end test for the BOQ CSV import endpoint.

Verifies the Phase 2 acceptance criterion: a malformed CSV
returns precise row/column errors and imports nothing
(atomic), while a valid CSV imports all rows.
"""
from __future__ import annotations

import sys
import time
import uuid

import httpx

BASE = "http://127.0.0.1:8000"
ADMIN = "admin@siteaudit.io"
ADMIN_PASS = "admin1234"

VALID_CSV = """item_code,description,unit,planned_qty,tolerance_pct,rate,category
CEM-001,Ordinary Portland Cement,bag,500,10,350,cement
STL-001,TMT Rebar 16mm,MT,12.5,5,52000,steel
SND-001,River Sand,m3,100,10,1800,sand
"""

MALFORMED_CSV = """item_code,description,unit,planned_qty
CEM-002,Portland Cement,bag,not-a-number
STL-002,Rebar,MT,12.5
"""

DUP_CSV = """item_code,description,unit,planned_qty
CEM-001,Duplicate Cement,bag,999
"""


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


def login(client: httpx.Client) -> dict:
    r = client.post(
        f"{BASE}/api/v1/auth/login",
        json={"email": ADMIN, "password": ADMIN_PASS},
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()


def make_project(client: httpx.Client, headers: dict, code: str) -> str:
    r = client.post(
        f"{BASE}/api/v1/projects/",
        headers=headers,
        json={
            "name": f"BOQ Test {code}",
            "code": code,
            "geofence_radius_m": 500.0,
            "start_date": "2026-01-01T00:00:00Z",
        },
    )
    assert r.status_code == 201, f"create project failed: {r.text}"
    return r.json()["id"]


def import_csv(
    client: httpx.Client, headers: dict, project_id: str, csv_text: str
) -> dict:
    r = client.post(
        f"{BASE}/api/v1/projects/{project_id}/boq/import",
        headers=headers,
        files={"file": ("boq.csv", csv_text.encode("utf-8"), "text/csv")},
    )
    return r


def count_items(client: httpx.Client, headers: dict, project_id: str) -> int:
    r = client.get(
        f"{BASE}/api/v1/projects/{project_id}/boq", headers=headers
    )
    assert r.status_code == 200, r.text
    return r.json()["total"]


def main() -> int:
    wait_for_server()
    with httpx.Client() as client:
        token = login(client)
        headers = {"Authorization": f"Bearer {token['access_token']}"}

        project_id = make_project(
            client, headers, f"BOQ{uuid.uuid4().hex[:8].upper()}"
        )

        # 1. Valid import
        r = import_csv(client, headers, project_id, VALID_CSV)
        assert r.status_code == 200, f"valid import failed: {r.text}"
        report = r.json()
        assert report["status"] == "OK", report
        assert report["imported"] == 3, report
        print(f"[ok] valid CSV imported {report['imported']} rows")
        assert count_items(client, headers, project_id) == 3

        # 2. Malformed CSV -> REJECTED, nothing imported (atomic)
        r = import_csv(client, headers, project_id, MALFORMED_CSV)
        assert r.status_code == 200, f"malformed import failed: {r.text}"
        report = r.json()
        assert report["status"] == "REJECTED", report
        assert report["imported"] == 0, report
        assert len(report["errors"]) >= 1, report
        err = report["errors"][0]
        assert err["row"] == 1 and err["column"] == "planned_qty", report
        assert "not a number" in err["message"], report
        print(
            f"[ok] malformed CSV rejected: row {err['row']} "
            f"col {err['column']}: {err['message']}"
        )
        # Atomicity: still only the original 3 items.
        assert count_items(client, headers, project_id) == 3, (
            "atomicity violated: malformed CSV imported rows"
        )
        print("[ok] atomicity: malformed CSV imported nothing")

        # 3. Duplicate item_code (against existing) -> REJECTED
        r = import_csv(client, headers, project_id, DUP_CSV)
        assert r.status_code == 200, f"dup import failed: {r.text}"
        report = r.json()
        assert report["status"] == "REJECTED", report
        assert report["imported"] == 0, report
        assert any(
            "already exists" in e["message"] for e in report["errors"]
        ), report
        print("[ok] duplicate item_code rejected")
        assert count_items(client, headers, project_id) == 3

        # 4. RBAC: supervisor may NOT import (admin-only)
        sup = client.post(
            f"{BASE}/api/v1/auth/login",
            json={
                "email": "supervisor@siteaudit.io",
                "password": "supervisor1234",
            },
        ).json()
        sup_headers = {"Authorization": f"Bearer {sup['access_token']}"}
        r = import_csv(client, sup_headers, project_id, VALID_CSV)
        assert r.status_code == 403, f"supervisor imported: {r.status_code}"
        print("[ok] RBAC: supervisor cannot import BOQ (403)")

        # 5. Supervisor (member) CAN read BOQ on a project they belong to
        sup_projects = client.get(
            f"{BASE}/api/v1/projects/", headers=sup_headers
        ).json()
        demo_id = next(
            p["id"] for p in sup_projects["items"] if p["code"] == "DEMO-001"
        )
        r = client.get(
            f"{BASE}/api/v1/projects/{demo_id}/boq", headers=sup_headers
        )
        assert r.status_code == 200, r.text
        print("[ok] supervisor can read BOQ on their own project (membership)")

        # 6. And CANNOT read BOQ of a project they are not a member of
        r = client.get(
            f"{BASE}/api/v1/projects/{project_id}/boq", headers=sup_headers
        )
        assert r.status_code == 403, r.text
        print("[ok] IDOR: supervisor cannot read BOQ of foreign project (403)")

    print("\nRESULT: ALL BOQ E2E CHECKS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
