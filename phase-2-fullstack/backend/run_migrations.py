#!/usr/bin/env python3
"""
Script to run database migrations for the Todo application.
This script will create the necessary tables in the database.
"""

import asyncio
from sqlmodel import SQLModel
from alembic.config import Config
from alembic import command
import os
from pathlib import Path

# Add the src directory to the path so imports work
import sys
sys.path.append(str(Path(__file__).parent))

from src.database import engine
from src.models.user import User
from src.models.task import Task


def run_migrations():
    """Run database migrations to create tables."""
    print("Initializing database tables...")

    # Create all tables defined in SQLModel models
    SQLModel.metadata.create_all(engine)

    print("Database tables created successfully!")
    print("- Users table created")
    print("- Tasks table created")
    print("- All indexes created")
    print("- Foreign key constraints applied")


if __name__ == "__main__":
    run_migrations()