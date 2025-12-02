"""
Client management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.client import ClientCreate, ClientResponse
from app.services.client_service import ClientService
from app.infrastructure.repositories.sqlalchemy_client_repository import SQLAlchemyClientRepository
from app.api.deps import get_current_active_user

router = APIRouter()

def get_client_service(db: Session = Depends(get_db)) -> ClientService:
    repository = SQLAlchemyClientRepository(db)
    return ClientService(repository)

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client: ClientCreate,
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_active_user)
):
    return service.create_client(client)

@router.get("/search", response_model=List[ClientResponse])
def search_clients(
    q: str = Query(..., min_length=1),
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_active_user)
):
    return service.search_clients(q)

@router.get("/", response_model=List[ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_active_user)
):
    return service.get_all_clients(skip, limit)
