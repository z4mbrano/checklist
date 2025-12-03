from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User

class SQLAlchemyUserRepository:
    def __init__(self, session: Session):
        self.session = session

    def search(self, query: str, limit: int = 10) -> List[User]:
        return (
            self.session.query(User)
            .filter(
                or_(
                    User.name.ilike(f"%{query}%"),
                    User.email.ilike(f"%{query}%")
                )
            )
            .filter(User.deleted_at.is_(None))
            .order_by(User.name.asc())
            .limit(limit)
            .all()
        )

    def get_by_email(self, email: str) -> User | None:
        return self.session.query(User).filter(User.email == email).first()

    def create(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
