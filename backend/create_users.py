#!/usr/bin/env python3
import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
sys.path.append(os.path.dirname(__file__))

from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole
from app.core.security import hash_password
from app.core.database import SessionLocal

def create_default_users():
    """Create default users for the system."""
    try:
        # Create session
        db = SessionLocal()
        
        # Create admin user
        admin = db.query(User).filter(User.email == "admin@vrd.com").first()
        if not admin:
            admin = User(
                name="Administrador",
                email="admin@vrd.com",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN
            )
            db.add(admin)
            print("✅ Admin user created: admin@vrd.com / admin123")
        else:
            print("ℹ️ Admin user already exists")
        
        # Create technician user  
        tecnico = db.query(User).filter(User.email == "tecnico@vrd.com").first()
        if not tecnico:
            tecnico = User(
                name="João Silva",
                email="tecnico@vrd.com", 
                hashed_password=hash_password("tecnico123"),
                role=UserRole.TECNICO
            )
            db.add(tecnico)
            print("✅ Technician user created: tecnico@vrd.com / tecnico123")
        else:
            print("ℹ️ Technician user already exists")
            
        db.commit()
        db.close()
        print("✅ Users created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")

if __name__ == "__main__":
    create_default_users()