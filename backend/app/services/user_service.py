from typing import List
from app.infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository
from app.models.user import User

class UserService:
    def __init__(self, repository: SQLAlchemyUserRepository):
        self.repository = repository

    def search_users(self, query: str, limit: int = 10) -> List[User]:
        return self.repository.search(query, limit)
