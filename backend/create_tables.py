import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.core.database import engine
from app.db.base import Base
from app.models.user import User

def create_tables():
    print("Creating tables...")
    Base.metadata.drop_all(bind=engine)  # Drop all tables first
    Base.metadata.create_all(bind=engine)  # Create all tables
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()