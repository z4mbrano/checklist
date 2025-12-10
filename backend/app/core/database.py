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
        "connect_args": {"check_same_thread": False}  # Needed for SQLite
    })
elif settings.database_url.startswith("mysql"):
    # MySQL configuration
    engine_kwargs.update({
        "pool_pre_ping": True,        # Verifica conexão antes de usar
        "pool_recycle": 3600,          # Recicla conexões a cada 1h
        "pool_size": 5,                # Máximo de 5 conexões simultâneas
        "max_overflow": 10,            # Permite até 10 conexões extras
        "connect_args": {
            "connect_timeout": 10,     # Timeout de 10 segundos
            "charset": "utf8mb4"       # Suporte a emojis e caracteres especiais
        }
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