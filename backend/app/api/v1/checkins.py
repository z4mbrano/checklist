from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.checkin import CheckinCreateFull, CheckinResponse, CheckinListResponse
from app.services.checkin_service import CheckinService
from app.domain.repositories.checkin_repository import CheckinRepository
from app.db.session import get_db

router = APIRouter()

def get_checkin_service(db: Session = Depends(get_db)) -> CheckinService:
    repository = CheckinRepository(db)
    return CheckinService(repository)

@router.post("/full", response_model=CheckinResponse, status_code=status.HTTP_201_CREATED)
async def create_full_checkin(
    *,
    request: CheckinCreateFull,
    service: CheckinService = Depends(get_checkin_service),
    current_user: User = Depends(get_current_active_user)
) -> CheckinResponse:
    request.user_id = current_user.id
    checkin = await service.create_full_checkin(request)
    return checkin

@router.get("/", response_model=CheckinListResponse)
async def list_checkins(
    *,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    service: CheckinService = Depends(get_checkin_service),
    current_user: User = Depends(get_current_active_user)
):
    skip = (page - 1) * size
    checkins = await service.get_history(skip=skip, limit=size)
    return {"items": checkins, "total": len(checkins)}