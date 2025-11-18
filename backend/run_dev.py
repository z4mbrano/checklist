"""
Simple backend runner for development without Docker
Uses SQLite instead of PostgreSQL for easier setup
"""
import os
import sys
import asyncio
from pathlib import Path

# Add app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.append(str(app_dir))

async def install_requirements():
    """Install required packages"""
    import subprocess
    
    requirements = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "sqlalchemy==2.0.23", 
        "alembic==1.13.0",
        "pydantic[email]==2.5.0",
        "pydantic-settings==2.1.0",
        "passlib[bcrypt]==1.7.4",
        "python-jose[cryptography]==3.3.0",
        "python-multipart==0.0.6",
    ]
    
    print("🔧 Installing Python dependencies...")
    for req in requirements:
        try:
            result = subprocess.run([sys.executable, "-m", "pip", "install", req], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Installed: {req}")
            else:
                print(f"⚠️  Warning installing {req}: {result.stderr}")
        except Exception as e:
            print(f"❌ Error installing {req}: {e}")

def setup_environment():
    """Setup environment variables for SQLite"""
    os.environ["DATABASE_URL"] = "sqlite:///./checklist.db"
    os.environ["SECRET_KEY"] = "development-secret-key-change-in-production"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
    
    print("🔧 Environment configured for SQLite")

async def create_database():
    """Create database tables"""
    print("🔧 Creating database tables...")
    
    try:
        from app.db.base import Base
        from app.db.session import engine
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    
    return True

async def seed_database():
    """Add initial data to database"""
    print("🔧 Seeding database with initial data...")
    
    try:
        from app.db.session import SessionLocal
        from app.models.user import User, UserRole
        from app.models.client import Client
        from app.models.project import Project, ProjectStatus
        from app.core.security import get_password_hash
        from datetime import datetime
        
        db = SessionLocal()
        
        try:
            # Create admin user if doesn't exist
            admin_user = db.query(User).filter(User.email == "admin@vrd.com").first()
            if not admin_user:
                admin_user = User(
                    email="admin@vrd.com",
                    name="Administrador",
                    hashed_password=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    is_active=True
                )
                db.add(admin_user)
                print("✅ Admin user created: admin@vrd.com / admin123")
            
            # Create technician user
            tech_user = db.query(User).filter(User.email == "tecnico@vrd.com").first()
            if not tech_user:
                tech_user = User(
                    email="tecnico@vrd.com",
                    name="João Silva",
                    hashed_password=get_password_hash("tecnico123"),
                    role=UserRole.TECNICO,
                    is_active=True
                )
                db.add(tech_user)
                print("✅ Technician user created: tecnico@vrd.com / tecnico123")
            
            # Create sample client
            client = db.query(Client).filter(Client.name == "VRD Tecnologia").first()
            if not client:
                client = Client(
                    name="VRD Tecnologia",
                    description="Cliente principal da empresa",
                    contact_email="contato@vrd.com",
                    contact_phone="(11) 99999-9999",
                    is_active=True
                )
                db.add(client)
                db.flush()  # Get the ID
                print("✅ Sample client created: VRD Tecnologia")
            
            # Create sample project
            project = db.query(Project).filter(Project.name == "Sistema de Check-in").first()
            if not project:
                project = Project(
                    name="Sistema de Check-in",
                    description="Desenvolvimento do sistema de controle de ponto",
                    client_id=client.id,
                    status=ProjectStatus.ACTIVE,
                    start_date=datetime.now()
                )
                db.add(project)
                print("✅ Sample project created: Sistema de Check-in")
            
            db.commit()
            print("🎉 Database seeded successfully!")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        return False
    
    return True

async def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting FastAPI server...")
    
    try:
        import uvicorn
        from app.main import app
        
        print("📡 Server starting at: http://localhost:8000")
        print("📖 API Documentation: http://localhost:8000/docs")
        print("🔍 Alternative docs: http://localhost:8000/redoc")
        print("\n💡 Test credentials:")
        print("   Admin: admin@vrd.com / admin123")
        print("   Tecnico: tecnico@vrd.com / tecnico123")
        print("\nPress Ctrl+C to stop the server")
        
        # Run the server
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        server = uvicorn.Server(config)
        await server.serve()
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

async def main():
    """Main setup and run function"""
    print("🎯 VRD Check-in System - Backend Setup")
    print("=" * 50)
    
    # Install dependencies
    await install_requirements()
    print()
    
    # Setup environment
    setup_environment()
    print()
    
    # Create database
    if not await create_database():
        return
    print()
    
    # Seed database
    if not await seed_database():
        return
    print()
    
    # Start server
    await start_server()

if __name__ == "__main__":
    asyncio.run(main())