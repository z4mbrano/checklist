from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.models.checkin import Checkin

class CheckinRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, checkin: Checkin) -> Checkin:
        self.session.add(checkin)
        self.session.commit()
        self.session.refresh(checkin)
        return checkin

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Checkin]:
        return (
            self.session.query(Checkin)
            .options(joinedload(Checkin.projeto))
            .order_by(desc(Checkin.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
