from sqlmodel import create_engine, Session
from typing import Generator
from contextlib import contextmanager
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_PfLaFc20Mqve@ep-shiny-sound-ahwn3tc7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

# For Neon, we need to handle the connection string properly
parsed_url = urlparse(DATABASE_URL)
if parsed_url.scheme == 'postgresql' and 'neon' in parsed_url.hostname:
    # Add sslmode=require for Neon connections
    if '?' not in DATABASE_URL:
        DATABASE_URL += "?sslmode=require"
    elif 'sslmode=' not in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"

# Create engine with appropriate settings
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20,
    connect_args={
        "keepalives_idle": 30,
        "keepalives_interval": 5,
        "keepalives_count": 3,
    }
)


def get_session() -> Generator[Session, None, None]:
    """
    Get a database session using dependency injection.
    This function is meant to be used with FastAPI's Depends().
    """
    with Session(engine) as session:
        yield session


@contextmanager
def get_session_context():
    """
    Context manager for database sessions.
    Use this when you need a session outside of FastAPI dependency injection.
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """
    Initialize the database by creating all tables.
    This should be called during application startup.
    """
    from sqlmodel import SQLModel
    from .models.user import User  # Import models to register them with SQLModel
    from .models.task import Task  # Import models to register them with SQLModel

    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()