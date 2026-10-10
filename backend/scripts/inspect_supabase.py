import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
from app.db.session import _normalize_database_url
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def inspect():
    settings = get_settings()
    url = _normalize_database_url(settings.database_url)
    engine = create_async_engine(url, echo=False)
    
    async with engine.connect() as conn:
        print("=== TABLES IN PUBLIC SCHEMA ===")
        res = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """))
        tables = [r[0] for r in res.fetchall()]
        print(tables)
        
        print("\n=== PUBLICATIONS ===")
        res = await conn.execute(text("""
            SELECT pubname 
            FROM pg_publication;
        """))
        for r in res.fetchall():
            print(f"Publication: '{r[0]}'")
        res = await conn.execute(text("""
            SELECT pubname, schemaname, tablename 
            FROM pg_publication_tables;
        """))
        for r in res.fetchall():
            print(f"Publication '{r[0]}': {r[1]}.{r[2]}")

        print("\n=== RLS ON PUBLIC TABLES ===")
        res = await conn.execute(text("""
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public';
        """))
        for r in res.fetchall():
            print(f"Table '{r[0]}': RLS = {r[1]}")

        print("\n=== POLICIES ===")
        res = await conn.execute(text("""
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
            FROM pg_policies;
        """))
        pols = res.fetchall()
        print(f"Total policies: {len(pols)}")
        for r in pols:
            print(f"Policy on {r[1]}: {r[2]} ({r[5]}) qual={r[6]}")

        print("\n=== ROW COUNTS & SAMPLE DATA ===")
        for tbl in ['projects', 'users', 'project_members', 'claim_photos', 'progress_claims', 'challans', 'audit_log']:
            if tbl in tables:
                count_res = await conn.execute(text(f"SELECT COUNT(*) FROM {tbl};"))
                cnt = count_res.scalar()
                print(f"Table {tbl}: {cnt} rows")
                if cnt > 0:
                    sample_res = await conn.execute(text(f"SELECT * FROM {tbl} LIMIT 3;"))
                    print(f"  Columns: {sample_res.keys()}")
                    for row in sample_res.fetchall():
                        print(f"  Sample: {dict(zip(sample_res.keys(), row))}")

        print("\n=== COLUMNS IN claim_photos ===")
        if 'claim_photos' in tables:
            cols_res = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'claim_photos' 
                ORDER BY ordinal_position;
            """))
            for col in cols_res.fetchall():
                print(f"  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(inspect())
