"""
Simple backend startup script for development
"""
import os
import sys

# Set environment variables for development
os.environ["DATABASE_URL"] = "sqlite:///./checklist.db"
os.environ["SECRET_KEY"] = "development-secret-key-please-change-in-production"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

# Add app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

print("🚀 Starting VRD Check-in System Backend")
print("=" * 50)

try:
    print("📦 Loading FastAPI application...")
    from app.main import app
    print("✅ Application loaded successfully!")
    
    print("🗄️ Database: SQLite (./checklist.db)")
    print("🔒 Authentication: JWT tokens")
    print("📡 Server: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("\n💡 Default test users will be created on first run:")
    print("   📧 admin@vrd.com / admin123 (Admin)")
    print("   📧 tecnico@vrd.com / tecnico123 (Technician)")
    
    # Create database tables
    print("\n🔧 Setting up database...")
    from app.db.base import Base
    from app.core.database import engine
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created!")
    
    # Try to create default users
    print("🔧 Creating default users...")
    try:
        from app.core.database import SessionLocal
        from app.models.user import User, UserRole
        from app.core.security import hash_password
        
        db = SessionLocal()
        try:
            # Create admin if doesn't exist
            if not db.query(User).filter(User.email == "admin@vrd.com").first():
                admin = User(
                    email="admin@vrd.com",
                    name="Administrator",
                    hashed_password=hash_password("admin123"),
                    role=UserRole.ADMIN,
                    is_active=True
                )
                db.add(admin)
                print("✅ Created admin user: admin@vrd.com")
            
            # Create technician if doesn't exist  
            if not db.query(User).filter(User.email == "tecnico@vrd.com").first():
                tech = User(
                    email="tecnico@vrd.com",
                    name="João Silva",
                    hashed_password=hash_password("tecnico123"),
                    role=UserRole.TECNICO,
                    is_active=True
                )
                db.add(tech)
                print("✅ Created technician user: tecnico@vrd.com")
            
            db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Warning: Could not create default users: {e}")
    
    # Start the server
    print("\n🚀 Starting server...")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\n💡 Make sure you have installed the required packages:")
    print("   pip install fastapi uvicorn sqlalchemy pydantic")
    
except Exception as e:
    print(f"❌ Error starting server: {e}")
    
finally:
    print("\n🛑 Backend stopped")