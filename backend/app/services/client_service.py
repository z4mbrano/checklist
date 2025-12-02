from typing import List
from app.infrastructure.repositories.sqlalchemy_client_repository import SQLAlchemyClientRepository
from app.schemas.client import ClientCreate, ClientResponse
from app.models.client import Client

class ClientService:
    def __init__(self, repository: SQLAlchemyClientRepository):
        self.repository = repository

    def create_client(self, client_data: ClientCreate) -> Client:
        return self.repository.create(client_data)

    def search_clients(self, query: str, limit: int = 10) -> List[Client]:
        return self.repository.search(query, limit)

    def get_all_clients(self, skip: int = 0, limit: int = 100) -> List[Client]:
        return self.repository.get_all(skip, limit)
