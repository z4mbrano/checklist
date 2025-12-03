import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def reset_passwords():
    db: Session = SessionLocal()
    try:
        # IDs to reset: 5, 6, 7. Also checking 2 just in case.
        # Admin is usually ID 1.
        target_ids = [2, 5, 6, 7]
        
        users = db.query(User).filter(User.id.in_(target_ids)).all()
        
        print(f"Found {len(users)} users to reset.")
        
        new_password = "123456"
        hashed = hash_password(new_password)
        
        for user in users:
            print(f"Resetting password for user: {user.email} (ID: {user.id})")
            user.hashed_password = hashed
            user.is_active = True
            user.deleted_at = None
            
        db.commit()
        print("Passwords reset successfully to '123456'")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_passwords()
