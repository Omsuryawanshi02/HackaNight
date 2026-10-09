"""Verify the dev.db schema after Alembic migration."""
import sqlite3

conn = sqlite3.connect("dev.db")
tables = [
    r[0]
    for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
]
print(f"Tables created: {len(tables)}")
for t in tables:
    print(f"  {t}")

expected = [
    "alembic_version",
    "alerts",
    "audit_log",
    "boq_items",
    "certificates",
    "challan_lines",
    "challans",
    "claim_photos",
    "jobs",
    "material_issues",
    "milestone_requirements",
    "milestones",
    "project_members",
    "projects",
    "progress_claims",
    "stages",
    "stock_ledger",
    "task_boq_norms",
    "tasks",  # work packages and tasks are one entity (spec: "work_packages / tasks")
    "users",
    "vendors",
    "vlm_results",
]
missing = [t for t in expected if t not in tables]
extra = [t for t in tables if t not in expected]
print(f"\nMissing expected tables: {missing}")
print(f"Unexpected tables: {extra}")
print("\nRESULT:", "PASS" if not missing and not extra else "FAIL")
