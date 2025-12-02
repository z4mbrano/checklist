"""
User management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserResponse
from app.services.user_service import UserService
from app.infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository
from app.api.deps import get_current_active_user

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    repository = SQLAlchemyUserRepository(db)
    return UserService(repository)

@router.get("/search", response_model=List[UserResponse])
def search_users(
    q: str = Query(..., min_length=1),
    service: UserService = Depends(get_user_service),
    current_user = Depends(get_current_active_user)
):
    return service.search_users(q)
