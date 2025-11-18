#!/usr/bin/env python3
"""
Quick backend test runner
"""
import subprocess
import sys
import os

def install_deps():
    """Install minimal dependencies"""
    deps = [
        "fastapi", "uvicorn", "sqlalchemy", "pydantic", 
        "pydantic-settings", "passlib", "python-jose", "python-multipart"
    ]
    
    print("🔧 Installing dependencies...")
    for dep in deps:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep], 
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"✅ {dep}")
        except subprocess.CalledProcessError:
            print(f"⚠️ Failed to install {dep}")

def setup_env():
    """Setup environment variables"""
    os.environ["DATABASE_URL"] = "sqlite:///./checklist.db"
    os.environ["SECRET_KEY"] = "dev-secret-key"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

def run_server():
    """Try to run the FastAPI server"""
    setup_env()
    
    print("🚀 Starting server...")
    print("📡 http://localhost:8000")
    print("📖 http://localhost:8000/docs")
    
    try:
        subprocess.run([sys.executable, "-c", """
import uvicorn
import os
import sys

# Add app to path
sys.path.insert(0, './app')

# Set environment
os.environ['DATABASE_URL'] = 'sqlite:///./checklist.db'
os.environ['SECRET_KEY'] = 'dev-secret-key'

try:
    from app.main import app
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
except ImportError as e:
    print(f"Import error: {e}")
    print("Some dependencies may be missing.")
except Exception as e:
    print(f"Error: {e}")
"""])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

if __name__ == "__main__":
    install_deps()
    run_server()