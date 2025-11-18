#!/usr/bin/env python3
"""
Simple backend test script to validate API endpoints
without requiring Docker or full database setup.
"""

import json
import asyncio
from typing import Dict, Any
from datetime import datetime, timedelta
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test that all modules can be imported successfully."""
    print("🔍 Testing module imports...")
    
    try:
        # Test core imports
        from app.main import app
        from app.core.config import settings
        from app.models.user import User, UserRole
        from app.models.client import Client
        from app.models.project import Project, ProjectStatus
        from app.models.checkin import Checkin, CheckinStatus
        from app.api.v1.auth import router as auth_router
        from app.api.v1.projects import router as projects_router
        from app.api.v1.checkins import router as checkins_router
        from app.core.security import create_access_token, verify_password, get_password_hash
        
        print("✅ All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_models():
    """Test model creation and validation."""
    print("\n🔍 Testing model validation...")
    
    try:
        from app.models.user import User, UserRole
        from app.models.client import Client
        from app.models.project import Project, ProjectStatus
        from app.models.checkin import Checkin, CheckinStatus
        from datetime import datetime
        
        # Test enum values
        assert UserRole.ADMIN == 'admin'
        assert UserRole.SUPERVISOR == 'supervisor' 
        assert UserRole.TECNICO == 'tecnico'
        
        assert ProjectStatus.ACTIVE == 'active'
        assert ProjectStatus.ON_HOLD == 'on_hold'
        assert ProjectStatus.COMPLETED == 'completed'
        
        assert CheckinStatus.ACTIVE == 'active'
        assert CheckinStatus.COMPLETED == 'completed'
        
        print("✅ Model enums validated!")
        
        # Test that classes are properly defined
        assert hasattr(User, '__tablename__')
        assert hasattr(Client, '__tablename__')
        assert hasattr(Project, '__tablename__')
        assert hasattr(Checkin, '__tablename__')
        
        print("✅ Model classes validated!")
        return True
        
    except Exception as e:
        print(f"❌ Model validation error: {e}")
        return False

def test_security():
    """Test security functions."""
    print("\n🔍 Testing security functions...")
    
    try:
        from app.core.security import create_access_token, verify_password, get_password_hash
        
        # Test password hashing
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        # Should be different
        assert hashed != password
        
        # Should verify correctly
        assert verify_password(password, hashed) == True
        assert verify_password("wrong_password", hashed) == False
        
        print("✅ Password hashing works!")
        
        # Test JWT token creation
        test_data = {"sub": "test@example.com"}
        token = create_access_token(data=test_data)
        
        # Should be a string
        assert isinstance(token, str)
        assert len(token) > 50  # JWT tokens are long
        
        print("✅ JWT token creation works!")
        return True
        
    except Exception as e:
        print(f"❌ Security test error: {e}")
        return False

def test_config():
    """Test configuration loading."""
    print("\n🔍 Testing configuration...")
    
    try:
        from app.core.config import settings
        
        # Test that settings load
        assert hasattr(settings, 'SECRET_KEY')
        assert hasattr(settings, 'DATABASE_URL')
        assert hasattr(settings, 'ACCESS_TOKEN_EXPIRE_MINUTES')
        
        # Test default values
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
        assert settings.SECRET_KEY is not None
        
        print("✅ Configuration loaded successfully!")
        print(f"   - Database URL: {settings.DATABASE_URL[:50]}...")
        print(f"   - Token expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_api_structure():
    """Test API router structure."""
    print("\n🔍 Testing API structure...")
    
    try:
        from app.main import app
        from app.api.v1.auth import router as auth_router
        from app.api.v1.projects import router as projects_router
        from app.api.v1.checkins import router as checkins_router
        from app.api.v1.clients import router as clients_router
        
        # Test that routers have expected routes
        auth_routes = [route.path for route in auth_router.routes]
        project_routes = [route.path for route in projects_router.routes]
        checkin_routes = [route.path for route in checkins_router.routes]
        
        print("✅ API routers loaded!")
        print(f"   - Auth routes: {len(auth_routes)}")
        print(f"   - Project routes: {len(project_routes)}")
        print(f"   - Checkin routes: {len(checkin_routes)}")
        
        # Check for key endpoints
        assert any("/login" in route for route in auth_routes)
        assert any("/refresh" in route for route in auth_routes)
        
        print("✅ Key endpoints found!")
        return True
        
    except Exception as e:
        print(f"❌ API structure error: {e}")
        return False

def test_schemas():
    """Test Pydantic schemas."""
    print("\n🔍 Testing schemas...")
    
    try:
        from app.schemas.auth import UserLogin, TokenResponse
        from app.schemas.project import ProjectCreate, ProjectResponse
        from app.schemas.checkin import CheckinCreate, CheckinResponse
        
        # Test user login schema
        login_data = {"email": "test@example.com", "password": "test123"}
        user_login = UserLogin(**login_data)
        assert user_login.email == "test@example.com"
        
        # Test project creation schema
        project_data = {
            "name": "Test Project",
            "description": "Test Description",
            "client_id": 1
        }
        project_create = ProjectCreate(**project_data)
        assert project_create.name == "Test Project"
        
        # Test checkin creation schema
        checkin_data = {
            "project_id": 1,
            "description": "Starting work"
        }
        checkin_create = CheckinCreate(**checkin_data)
        assert checkin_create.project_id == 1
        
        print("✅ Schema validation works!")
        return True
        
    except Exception as e:
        print(f"❌ Schema error: {e}")
        return False

async def test_dependencies():
    """Test that all dependencies are available."""
    print("\n🔍 Testing dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import alembic
        import pydantic
        import passlib
        import jose
        import redis  # This might fail if Redis is not installed, which is OK
        
        print("✅ Core dependencies available!")
        print(f"   - FastAPI: {fastapi.__version__}")
        print(f"   - SQLAlchemy: {sqlalchemy.__version__}")
        print(f"   - Pydantic: {pydantic.__version__}")
        
        return True
        
    except ImportError as e:
        print(f"⚠️  Missing dependency: {e}")
        return False
    except Exception as e:
        print(f"❌ Dependency error: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting Backend Validation Tests")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_config,
        test_models,
        test_security,
        test_schemas,
        test_api_structure,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
    
    # Run async test
    try:
        async_result = asyncio.run(test_dependencies())
        results.append(async_result)
    except Exception as e:
        print(f"❌ Async test failed: {e}")
        results.append(False)
    
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    passed = sum(results)
    total = len(results)
    
    print(f"   ✅ Passed: {passed}/{total}")
    print(f"   ❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! Backend structure is valid.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} tests failed. Check the backend setup.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)