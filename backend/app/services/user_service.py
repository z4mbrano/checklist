from typing import List
from fastapi import HTTPException, status
from app.infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

class UserService:
    def __init__(self, repository: SQLAlchemyUserRepository):
        self.repository = repository

    def search_users(self, query: str, limit: int = 10) -> List[User]:
        return self.repository.search(query, limit)

    def create_user(self, data: UserCreate) -> User:
        # Check if user already exists
        if self.repository.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        # Create user
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password),
            role=data.role,
            is_active=True
        )
        
        return self.repository.create(user)
