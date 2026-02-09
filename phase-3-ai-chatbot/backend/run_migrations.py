"""Helper script to run database migrations."""

import subprocess
import sys


def run_migrations():
    """Run Alembic migrations to upgrade database."""
    print("🔄 Running database migrations...")
    
    try:
        result = subprocess.run(
            ["uv", "run", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=True
        )
        
        print("✅ Migrations completed successfully!")
        print(result.stdout)
        
    except subprocess.CalledProcessError as e:
        print("❌ Migration failed!")
        print(e.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: 'uv' command not found.")
        print("   Install uv: pip install uv")
        sys.exit(1)


if __name__ == "__main__":
    run_migrations()