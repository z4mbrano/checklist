from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.sprint import SprintCreate, SprintResponse, SprintTaskUpdate, SprintTaskResponse, SprintUpdate
from app.services.sprint_service import SprintService
from app.models.sprint import SprintStatus

router = APIRouter()

def get_sprint_service(db: Session = Depends(get_db)) -> SprintService:
    return SprintService(db)

@router.post("/", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
def create_sprint(
    sprint_in: SprintCreate,
    service: SprintService = Depends(get_sprint_service),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new sprint."""
    return service.create_sprint(sprint_in)

@router.get("/", response_model=List[SprintResponse])
def list_sprints(
    project_id: Optional[int] = None,
    status: Optional[SprintStatus] = None,
    service: SprintService = Depends(get_sprint_service),
    current_user: User = Depends(get_current_active_user)
):
    """List sprints."""
    return service.get_sprints(project_id, status)

@router.get("/{sprint_id}", response_model=SprintResponse)
def get_sprint(
    sprint_id: int,
    service: SprintService = Depends(get_sprint_service),
    current_user: User = Depends(get_current_active_user)
):
    """Get sprint details."""
    sprint = service.get_sprint(sprint_id)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint

@router.patch("/tasks/{task_id}", response_model=SprintTaskResponse)
def update_task_status(
    task_id: int,
    task_update: SprintTaskUpdate,
    service: SprintService = Depends(get_sprint_service),
    current_user: User = Depends(get_current_active_user)
):
    """Update task status."""
    task = service.update_task_status(task_id, task_update.is_completed)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{sprint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sprint(
    sprint_id: int,
    service: SprintService = Depends(get_sprint_service),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a sprint."""
    success = service.delete_sprint(sprint_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return None

@router.patch("/{sprint_id}/status", response_model=SprintResponse)
def update_sprint_status(
    sprint_id: int,
    status_update: SprintUpdate,
    service: SprintService = Depends(get_sprint_service),
    current_user: User = Depends(get_current_active_user)
):
    """Update sprint status."""
    if not status_update.status:
         raise HTTPException(status_code=400, detail="Status is required")
         
    sprint = service.update_sprint_status(sprint_id, status_update.status)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint
