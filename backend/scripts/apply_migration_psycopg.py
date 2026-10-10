import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
import psycopg

STATEMENTS = [
    # 1. Add uploaded_at to claim_photos if not exists
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'claim_photos' AND column_name = 'uploaded_at'
        ) THEN
            ALTER TABLE claim_photos ADD COLUMN uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now();
        END IF;
    END $$;
    """,

    # 2. Add captured_at to claim_photos if not exists
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'claim_photos' AND column_name = 'captured_at'
        ) THEN
            ALTER TABLE claim_photos ADD COLUMN captured_at TIMESTAMPTZ NULL;
        END IF;
    END $$;
    """,

    # 3. Set REPLICA IDENTITY FULL on projects
    "ALTER TABLE projects REPLICA IDENTITY FULL;",

    # 4. Set REPLICA IDENTITY FULL on project_members
    "ALTER TABLE project_members REPLICA IDENTITY FULL;",

    # 5. Add projects to supabase_realtime publication
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE projects;
        END IF;
    END $$;
    """,

    # 6. Add project_members to supabase_realtime publication
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'project_members'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
        END IF;
    END $$;
    """,

    # 7. Enable RLS on projects
    "ALTER TABLE projects ENABLE ROW LEVEL SECURITY;",

    # 8. Enable RLS on project_members
    "ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;",

    # 9. Scoped policy for projects
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'projects' AND policyname = 'projects_select_policy'
        ) THEN
            CREATE POLICY "projects_select_policy" ON projects
            FOR SELECT USING (
                auth.role() = 'service_role' OR
                auth.role() = 'anon' OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'Main Supervisor')
                ) OR
                EXISTS (
                    SELECT 1 FROM project_members 
                    WHERE project_members.project_id = projects.id 
                      AND project_members.user_id = auth.uid()
                )
            );
        END IF;
    END $$;
    """,

    # 10. Scoped policy for project_members
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'project_members' AND policyname = 'project_members_select_policy'
        ) THEN
            CREATE POLICY "project_members_select_policy" ON project_members
            FOR SELECT USING (
                auth.role() = 'service_role' OR
                auth.role() = 'anon' OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'Main Supervisor')
                ) OR
                project_members.user_id = auth.uid()
            );
        END IF;
    END $$;
    """
]

def main():
    settings = get_settings()
    raw_url = settings.database_url
    # Clean driver to standard postgresql://
    clean_dsn = raw_url.replace("postgresql+asyncpg://", "postgresql://").replace("postgres://", "postgresql://")
    print("Connecting to Supabase PostgreSQL using psycopg...")
    with psycopg.connect(clean_dsn, autocommit=True, connect_timeout=15) as conn:
        with conn.cursor() as cur:
            print("Connected! Executing additive migration statements...")
            for i, stmt in enumerate(STATEMENTS, 1):
                print(f"[{i}/{len(STATEMENTS)}] Executing...")
                cur.execute(stmt.strip())
                print(f"[{i}/{len(STATEMENTS)}] Success.")
            
            print("\nVerifying supabase_realtime publication...")
            cur.execute("SELECT pubname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';")
            for r in cur.fetchall():
                print(f"  Publication '{r[0]}' -> table '{r[1]}'")
                
            print("\nVerifying claim_photos timestamp columns...")
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'claim_photos' AND column_name IN ('uploaded_at', 'captured_at');
            """)
            for r in cur.fetchall():
                print(f"  Column '{r[0]}' ({r[1]}), default: {r[3]}")

if __name__ == "__main__":
    main()
