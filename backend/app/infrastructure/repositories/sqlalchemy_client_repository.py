from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.client import Client
from app.schemas.client import ClientCreate

class SQLAlchemyClientRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, client_data: ClientCreate) -> Client:
        # Map Pydantic model to SQLAlchemy model
        # Note: Pydantic model uses aliases (nome, etc), but when accessing attributes we use the field names (name, etc)
        # However, the SQLAlchemy model expects the column names (nome, cnpj, etc)
        
        db_client = Client(
            nome=client_data.name,
            cnpj=client_data.cnpj,
            telefone=client_data.phone,
            email=client_data.email,
            endereco=client_data.address,
            cidade=client_data.city,
            estado=client_data.state,
            cep=client_data.zip_code,
            ativo=1
        )
        self.session.add(db_client)
        self.session.commit()
        self.session.refresh(db_client)
        return db_client

    def search(self, query: str, limit: int = 10) -> List[Client]:
        return (
            self.session.query(Client)
            .filter(
                or_(
                    Client.nome.ilike(f"%{query}%"),
                    Client.cnpj.ilike(f"%{query}%")
                )
            )
            .filter(Client.deleted_at.is_(None))
            .order_by(Client.nome.asc())
            .limit(limit)
            .all()
        )

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Client]:
        return (
            self.session.query(Client)
            .filter(Client.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
            .all()
        )
