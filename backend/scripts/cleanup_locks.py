import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
import psycopg

def main():
    settings = get_settings()
    clean_dsn = settings.database_url.replace("postgresql+asyncpg://", "postgresql://").replace("postgres://", "postgresql://")
    with psycopg.connect(clean_dsn, autocommit=True, connect_timeout=10) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT pid, pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE pid != pg_backend_pid() 
                  AND usename = 'postgres' 
                  AND backend_type = 'client backend';
            """)
            print("Terminated stuck client backends:", cur.fetchall(), flush=True)

if __name__ == "__main__":
    main()
