"""
Minimal FastAPI app without database dependencies
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Dict, Any

# Security scheme
security = HTTPBearer()

# Create FastAPI application
app = FastAPI(
    title="Check-in System API",
    version="1.0.0",
    description="Sistema de Check-in/Check-out - API Mínima",
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for testing
MOCK_USERS = {
    "admin@vrd.com": {
        "id": 1,
        "email": "admin@vrd.com", 
        "name": "Administrator",
        "password": "admin123",  # In real app, this would be hashed
        "role": "ADMIN"
    },
    "tecnico@vrd.com": {
        "id": 2,
        "email": "tecnico@vrd.com",
        "name": "João Silva", 
        "password": "tecnico123",
        "role": "TECNICO"
    }
}

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "Sistema de Check-in/Check-out API - Versão Mínima",
        "version": "1.0.0",
        "status": "running",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "version": "1.0.0",
        "message": "API está funcionando corretamente"
    }


@app.get("/api/v1/test")
async def test_endpoint():
    """Test endpoint."""
    return {
        "message": "API funcionando!",
        "timestamp": "2024-11-19T12:00:00Z",
        "endpoints": [
            "/",
            "/health",
            "/api/v1/test",
            "/api/v1/auth/login",
            "/docs",
            "/redoc"
        ]
    }


@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login endpoint - mock implementation."""
    user = MOCK_USERS.get(request.email)
    
    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=401, 
            detail="Email ou senha incorretos"
        )
    
    # In a real app, you'd generate a proper JWT token
    mock_token = f"mock_token_for_{user['id']}"
    
    return LoginResponse(
        access_token=mock_token,
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    )


@app.get("/api/v1/auth/me")
async def get_current_user(token: str = Depends(security)):
    """Get current user - mock implementation."""
    # Simple mock: extract user ID from token
    if not token.credentials.startswith("mock_token_for_"):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    try:
        user_id = int(token.credentials.replace("mock_token_for_", ""))
        user = next((u for u in MOCK_USERS.values() if u["id"] == user_id), None)
        
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")


@app.get("/api/v1/projects/")
async def get_projects(token: str = Depends(security)):
    """Get projects - mock implementation."""
    return [
        {
            "id": 1,
            "name": "Sistema de Check-in",
            "description": "Desenvolvimento do sistema de controle de ponto",
            "client_id": 1,
            "status": "ACTIVE"
        }
    ]


@app.get("/api/v1/clients/")
async def get_clients(token: str = Depends(security)):
    """Get clients - mock implementation."""
    return [
        {
            "id": 1,
            "name": "VRD Tecnologia",
            "description": "Cliente principal da empresa",
            "contact_email": "contato@vrd.com",
            "is_active": True
        }
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)