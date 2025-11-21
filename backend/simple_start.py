"""
Simple backend startup script that bypasses SQLAlchemy compatibility issues
"""
import os
import sys

# Set environment variables for development
os.environ["DATABASE_URL"] = "sqlite:///./checklist.db"
os.environ["SECRET_KEY"] = "development-secret-key-please-change-in-production"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

print("🚀 Starting VRD Check-in System Backend")
print("=" * 50)

try:
    print("📦 Loading FastAPI application...")
    
    # Try to import and start the server without database setup
    import uvicorn
    
    print("✅ Uvicorn loaded successfully!")
    print("🗄️ Database: SQLite (./checklist.db)")
    print("🔒 Authentication: JWT tokens")
    print("📡 Server: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    
    print("\n🚀 Starting server...")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    
    # Start the server - let FastAPI handle the app loading
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
    print("   pip install fastapi uvicorn")
    
except Exception as e:
    print(f"❌ Error starting server: {e}")
    
finally:
    print("\n🛑 Backend stopped")