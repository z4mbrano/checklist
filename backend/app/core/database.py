"""
Database configuration and setup
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine_kwargs = {"echo": False}  # Default echo to False

# Add SQLite-specific configuration
if settings.database_url.startswith("sqlite"):
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False},  # Needed for SQLite
        "poolclass": None  # SQLite doesn't need connection pooling
    })
else:
    # PostgreSQL configuration  
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
    })

engine = create_engine(settings.database_url, **engine_kwargs)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Database session dependency for FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()