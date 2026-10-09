"""Verify fixes: root route + tasks/stages CRUD (exercises _get_stage join)."""
from __future__ import annotations

import sys
import time
import uuid

import httpx

BASE = "http://127.0.0.1:8000"
ADMIN = "admin@siteaudit.io"
ADMIN_PASS = "admin1234"


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
        # 1. Root route (was 404, now service info)
        r = client.get(f"{BASE}/")
        print(f"GET  /                    -> {r.status_code}")
        if r.status_code == 200:
            print(f"        {r.json()}")
        assert r.status_code == 200, "root route still 404"

        # Login as admin
        r = client.post(
            f"{BASE}/api/v1/auth/login",
            json={"email": ADMIN, "password": ADMIN_PASS},
        )
        assert r.status_code == 200, r.text
        headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

        # Get DEMO-001 project id
        r = client.get(f"{BASE}/api/v1/projects/", headers=headers)
        demo = next(p for p in r.json()["items"] if p["code"] == "DEMO-001")
        pid = demo["id"]
        print(f"\nUsing project DEMO-001 ({pid})")

        # 2. Create a task
        r = client.post(
            f"{BASE}/api/v1/projects/{pid}/tasks",
            headers=headers,
            json={
                "name": "Foundation Work",
                "weight_pct": 10.0,
            },
        )
        assert r.status_code == 201, f"create task failed: {r.text}"
        task_id = r.json()["id"]
        print(f"[ok] POST task            -> 201 ({task_id})")

        # 3. Create a stage for the task
        r = client.post(
            f"{BASE}/api/v1/projects/{pid}/tasks/{task_id}/stages",
            headers=headers,
            json={
                "sequence": 1,
                "name": "Excavation",
                "description": "Site excavation and grading",
                "expected_visual_cues": ["excavator", "cleared ground"],
                "required_photo_count": 3,
            },
        )
        assert r.status_code == 201, f"create stage failed: {r.text}"
        stage_id = r.json()["id"]
        print(f"[ok] POST stage           -> 201 ({stage_id})")

        # 4. List stages (exercises the join)
        r = client.get(
            f"{BASE}/api/v1/projects/{pid}/tasks/{task_id}/stages",
            headers=headers,
        )
        assert r.status_code == 200, f"list stages failed: {r.text}"
        assert len(r.json()) == 1, r.json()
        print(f"[ok] GET  stages          -> 200 (1 stage)")

        # 5. PATCH the stage (exercises _get_stage with the join)
        r = client.patch(
            f"{BASE}/api/v1/projects/{pid}/tasks/{task_id}/stages/{stage_id}",
            headers=headers,
            json={"description": "Updated excavation description"},
        )
        assert r.status_code == 200, f"patch stage failed: {r.text}"
        assert r.json()["description"] == "Updated excavation description"
        print(f"[ok] PATCH stage          -> 200 (_get_stage join works)")

        # 6. Add a BOQ norm to the task
        # First create a BOQ item
        r = client.post(
            f"{BASE}/api/v1/projects/{pid}/boq",
            headers=headers,
            json={
                "item_code": "CEM-TEST",
                "description": "Test Cement",
                "unit": "bag",
                "planned_qty": 100,
                "category": "cement",
            },
        )
        assert r.status_code == 201, f"create boq failed: {r.text}"
        boq_id = r.json()["id"]

        r = client.post(
            f"{BASE}/api/v1/projects/{pid}/tasks/{task_id}/norms",
            headers=headers,
            json={
                "boq_item_id": boq_id,
                "norm_qty_per_unit_work": 2.5,
            },
        )
        assert r.status_code == 201, f"create norm failed: {r.text}"
        print(f"[ok] POST norm            -> 201 (task-BOQ norm)")

        # 7. Cross-project IDOR: stage from another project
        fake_pid = uuid.uuid4()
        r = client.get(
            f"{BASE}/api/v1/projects/{fake_pid}/tasks/{task_id}/stages/{stage_id}",
            headers=headers,
        )
        # ADMIN bypasses membership, but the stage's task belongs to
        # DEMO-001, not fake_pid, so the join filter returns 404.
        assert r.status_code == 404, f"expected 404, got {r.status_code}"
        print(f"[ok] cross-project stage  -> 404 (scoped by project)")

    print("\nRESULT: ALL FIX-VERIFICATION CHECKS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
