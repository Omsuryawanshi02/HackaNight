"""Quick DB state check."""
import sqlite3

conn = sqlite3.connect("dev.db")
tables = [
    r[0]
    for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
]
print(f"Tables: {len(tables)}")
ver = conn.execute("SELECT version_num FROM alembic_version").fetchall()
print(f"alembic_version: {ver}")
users = conn.execute("SELECT email, role FROM users ORDER BY email").fetchall()
print(f"Users: {len(users)}")
for u in users:
    print(f"  {u[0]} {u[1]}")
projs = conn.execute("SELECT code, name FROM projects").fetchall()
print(f"Projects: {projs}")
members = conn.execute("SELECT COUNT(*) FROM project_members").fetchone()
print(f"Memberships: {members[0]}")
