"""
Project management endpoints
"""
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectResponse, ProjectCreate, ProjectUpdate

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def read_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user)
) -> Any:
    """
    Retrieve projects.
    """
    projects = db.query(Project).filter(Project.deleted_at.is_(None)).offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=ProjectResponse)
async def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: ProjectCreate,
    current_user = Depends(get_current_active_user)
) -> Any:
    """
    Create new project.
    """
    project = Project(
        nome=project_in.name,
        descricao=project_in.description,
        data_inicio=project_in.start_date,
        data_fim_prevista=project_in.end_date,
        status=project_in.status,
        cliente_id=project_in.client_id,
        responsavel_id=current_user.id  # Assign current user as responsible for now
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(
    *,
    db: Session = Depends(get_db),
    project_id: int,
    current_user = Depends(get_current_active_user)
) -> Any:
    """
    Get project by ID.
    """
    project = db.query(Project).filter(Project.id == project_id, Project.deleted_at.is_(None)).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project
