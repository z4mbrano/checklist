"""
Project DTOs/Schemas

Data Transfer Objects for API input/output.
These schemas define the contract between API and clients.

Architecture Note:
- Independent from domain entities (app.domain.entities.project)
- Independent from ORM models (app.models.project)
- Focused on API concerns: validation, serialization, documentation
"""
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator

# Import domain enum for consistency
from app.domain.entities.project import ProjectStatus


class ProjectCreateRequest(BaseModel):
    """
    Request DTO for creating a new project.
    
    Validation:
    - Name: Required, non-empty, max 200 chars
    - Dates: end_date_planned must be after start_date (validated in service)
    - Client ID: Required positive integer
    """
    name: str = Field(..., min_length=1, max_length=200, description="Project name")
    description: Optional[str] = Field(None, max_length=5000, description="Project description")
    start_date: date = Field(..., description="Project start date")
    end_date_planned: Optional[date] = Field(None, description="Planned completion date")
    client_id: int = Field(..., gt=0, description="Client ID who owns this project")
    responsible_user_id: int = Field(..., gt=0, description="User responsible for this project")
    estimated_value: Optional[str] = Field(None, max_length=20, description="Estimated project value")
    observations: Optional[str] = Field(None, max_length=5000, description="Additional notes")
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        """Ensure name is not just whitespace."""
        if not v.strip():
            raise ValueError('Project name cannot be empty or whitespace')
        return v.strip()


class ProjectUpdateRequest(BaseModel):
    """
    Request DTO for updating project details.
    
    All fields are optional - only provided fields will be updated.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    end_date_planned: Optional[date] = None
    estimated_value: Optional[str] = Field(None, max_length=20)
    observations: Optional[str] = Field(None, max_length=5000)
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        """Ensure name is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError('Project name cannot be empty or whitespace')
        return v.strip() if v else None


class ProjectStatusTransitionRequest(BaseModel):
    """Request DTO for project status transitions (start, pause, complete, cancel)."""
    completion_date: Optional[date] = Field(None, description="Actual completion date (for complete action)")
    cancellation_reason: Optional[str] = Field(None, max_length=500, description="Reason for cancellation")


class ProjectResponse(BaseModel):
    """
    Response DTO for project data.
    
    Includes all project details for client consumption.
    """
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date_planned: Optional[date] = None
    end_date_actual: Optional[date] = None
    status: ProjectStatus
    client_id: int
    responsible_user_id: int
    estimated_value: Optional[str] = None
    observations: Optional[str] = None
    
    # Computed fields
    is_active: bool = Field(description="True if project is currently active")
    is_overdue: bool = Field(description="True if past planned end date")
    duration_days: Optional[int] = Field(None, description="Actual duration in days (if completed)")
    
    # Metadata
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Allow creation from domain entities
    
    @classmethod
    def from_domain(cls, project: 'Project') -> 'ProjectResponse':
        """
        Factory method to create DTO from domain entity.
        
        Args:
            project: Domain entity (app.domain.entities.project.Project)
            
        Returns:
            ProjectResponse DTO
        """
        from app.domain.entities.project import Project as DomainProject
        
        return cls(
            id=project.id,
            name=project.name,
            description=project.description,
            start_date=project.start_date,
            end_date_planned=project.end_date_planned,
            end_date_actual=project.end_date_actual,
            status=project.status,
            client_id=project.client_id,
            responsible_user_id=project.responsible_user_id,
            estimated_value=project.estimated_value,
            observations=project.observations,
            is_active=project.is_active,
            is_overdue=project.is_overdue,
            duration_days=project.duration_days,
            created_at=project.created_at,
            updated_at=project.updated_at
        )


class ProjectListResponse(BaseModel):
    """Response DTO for paginated project lists."""
    items: list[ProjectResponse]
    total: int = Field(description="Total number of projects (for pagination)")
    skip: int = Field(description="Number of skipped items")
    limit: int = Field(description="Maximum items per page")


class ProjectStatisticsResponse(BaseModel):
    """Response DTO for project statistics/analytics."""
    planejamento: int = Field(description="Projects in planning")
    em_andamento: int = Field(description="Active projects")
    pausado: int = Field(description="Paused projects")
    concluido: int = Field(description="Completed projects")
    cancelado: int = Field(description="Cancelled projects")
    total_active: int = Field(description="Total currently active")
    total_overdue: int = Field(description="Total overdue projects")

