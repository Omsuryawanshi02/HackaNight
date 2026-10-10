"""realtime allotment and photo timestamps

Revision ID: b992184e9102
Revises: a884073a5439
Create Date: 2026-10-10 10:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b992184e9102'
down_revision: Union[str, Sequence[str], None] = 'a884073a5439'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add uploaded_at and captured_at columns to claim_photos if not exists
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'claim_photos' AND column_name = 'uploaded_at'
        ) THEN
            ALTER TABLE claim_photos ADD COLUMN uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now();
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'claim_photos' AND column_name = 'captured_at'
        ) THEN
            ALTER TABLE claim_photos ADD COLUMN captured_at TIMESTAMPTZ NULL;
        END IF;

        ALTER TABLE claim_photos ALTER COLUMN claim_id DROP NOT NULL;
    END $$;
    """)

    # 2. Set REPLICA IDENTITY FULL on projects and project_members for Realtime DELETE/UPDATE
    op.execute("ALTER TABLE projects REPLICA IDENTITY FULL;")
    op.execute("ALTER TABLE project_members REPLICA IDENTITY FULL;")

    # 3. Add projects and project_members to supabase_realtime publication
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE projects;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'project_members'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
        END IF;
    END $$;
    """)

    # 4. Enable Row Level Security (RLS) on projects and project_members
    op.execute("ALTER TABLE projects ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;")

    # 5. Add minimal, correctly scoped SELECT policies
    op.execute("""
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
    """)


def downgrade() -> None:
    pass
