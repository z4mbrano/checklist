"""
API dependencies for authentication and authorization
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_token, get_user_id_from_token, get_user_role_from_token
from app.models.user import User, UserRole
from app.core.exceptions import unauthorized

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    user_id = get_user_id_from_token(token)
    
    user = db.query(User).filter(
        User.id == user_id,
        User.is_active == True,
        User.deleted_at.is_(None)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require admin role."""
    if not current_user.is_admin:
        raise unauthorized()
    return current_user


async def require_supervisor_or_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require supervisor or admin role."""
    if not (current_user.is_supervisor or current_user.is_admin):
        raise unauthorized()
    return current_user


async def require_tecnico_or_higher(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Require tecnico, supervisor or admin role."""
    if current_user.role not in [UserRole.TECNICO, UserRole.SUPERVISOR, UserRole.ADMIN]:
        raise unauthorized()
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get optional authenticated user (for endpoints that work with or without auth)."""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        user_id = get_user_id_from_token(token)
        
        user = db.query(User).filter(
            User.id == user_id,
            User.is_active == True,
            User.deleted_at.is_(None)
        ).first()
        
        return user
    except:
        return None