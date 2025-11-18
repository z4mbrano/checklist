import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_test_user():
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == "admin@vrd.com").first()
        if existing_user:
            print("User admin@vrd.com already exists!")
            return
            
        # Create new user
        user = User(
            name="Admin",
            email="admin@vrd.com",
            hashed_password=hash_password("123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"User created successfully!")
        print(f"Email: {user.email}")
        print(f"Name: {user.name}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()