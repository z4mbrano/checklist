@echo off
echo 🎯 VRD Check-in System - Backend Setup
echo ==========================================
echo.

echo 🔧 Installing Python dependencies...
python -m pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 sqlalchemy==2.0.23 pydantic[email]==2.5.0 pydantic-settings==2.1.0 passlib[bcrypt]==1.7.4 python-jose[cryptography]==3.3.0 python-multipart==0.0.6 alembic==1.13.0

if %errorlevel% neq 0 (
    echo ❌ Error installing dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

echo 🗄️ Setting up SQLite database...
set DATABASE_URL=sqlite:///./checklist.db
set SECRET_KEY=development-secret-key-change-in-production  
set ACCESS_TOKEN_EXPIRE_MINUTES=30

echo.
echo 🚀 Starting backend server...
echo 📡 Server will start at: http://localhost:8000
echo 📖 API Documentation: http://localhost:8000/docs
echo.
echo 💡 Test credentials:
echo    Admin: admin@vrd.com / admin123
echo    Tecnico: tecnico@vrd.com / tecnico123
echo.
echo Press Ctrl+C to stop the server
echo.

python run_dev.py

pause