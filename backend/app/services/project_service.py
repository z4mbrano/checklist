"""
Project Application Service

Orchestrates business operations for projects.
This is the Application Layer in Clean Architecture.

Responsibilities:
- Coordinate between domain entities and repositories
- Enforce business rules and validation
- Manage transactions (via Unit of Work pattern - future enhancement)
- Transform DTOs to domain entities and vice versa

Does NOT:
- Know about HTTP/REST (that's the controller's job)
- Know about SQLAlchemy (that's the repository's job)
- Contain framework-specific code

Architecture Pattern: Application Service (DDD)
- Stateless (no instance variables except dependencies)
- Transaction boundary (each method is one transaction)
- Thin orchestration layer
"""
from typing import List, Optional
from datetime import date

from app.domain.entities.project import (
    Project,
    ProjectStatus,
    BusinessRuleViolationError,
    InvalidStateTransitionError
)
from app.domain.repositories.project_repository import (
    IProjectRepository,
    ProjectNotFoundError
)
from app.core.logging import get_logger

logger = get_logger(__name__)


class ProjectService:
    """
    Application service for project operations.
    
    Design Pattern: Facade + Coordinator
    - Provides high-level API for project operations
    - Coordinates between domain entities and repositories
    - Enforces business workflows
    """
    
    def __init__(self, project_repository: IProjectRepository):
        """
        Initialize service with dependencies.
        
        Args:
            project_repository: Repository abstraction (injected via DI)
        """
        self.repository = project_repository
    
    # ========================================
    # CRUD Operations
    # ========================================
    
    def create_project(
        self,
        name: str,
        client_id: int,
        responsible_user_id: int,
        start_date: date,
        description: Optional[str] = None,
        end_date_planned: Optional[date] = None,
        estimated_value: Optional[str] = None
    ) -> Project:
        """
        Create a new project.
        
        Business Rules Enforced:
        1. End date must be after start date (via domain entity)
        2. Name is required (non-empty)
        3. Client and responsible user must exist (validated elsewhere)
        
        Args:
            name: Project name (required)
            client_id: Client who owns this project
            responsible_user_id: User responsible for project
            start_date: Project start date
            description: Optional description
            end_date_planned: Planned completion date (optional)
            estimated_value: Estimated cost/value (optional)
            
        Returns:
            Created project with generated ID
            
        Raises:
            BusinessRuleViolationError: If business rules are violated
        """
        # Validation
        if not name or not name.strip():
            raise BusinessRuleViolationError("Project name cannot be empty")
        
        # Create domain entity (validation happens in __post_init__)
        project = Project(
            name=name.strip(),
            description=description,
            start_date=start_date,
            end_date_planned=end_date_planned,
            status=ProjectStatus.PLANEJAMENTO,
            client_id=client_id,
            responsible_user_id=responsible_user_id,
            estimated_value=estimated_value
        )
        
        # Persist via repository
        saved_project = self.repository.save(project)
        
        logger.info(
            "project_created_via_service",
            project_id=saved_project.id,
            name=saved_project.name,
            client_id=client_id
        )
        
        return saved_project
    
    def get_project(self, project_id: int) -> Project:
        """
        Retrieve project by ID.
        
        Args:
            project_id: Unique identifier
            
        Returns:
            Project domain entity
            
        Raises:
            ProjectNotFoundError: If project doesn't exist
        """
        project = self.repository.get_by_id(project_id)
        
        if not project:
            raise ProjectNotFoundError(project_id)
        
        return project
    
    def list_projects(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[ProjectStatus] = None,
        client_id: Optional[int] = None
    ) -> List[Project]:
        """
        List projects with optional filtering.
        
        Args:
            skip: Pagination offset
            limit: Maximum results (capped at 100 for performance)
            status: Filter by status (optional)
            client_id: Filter by client (optional)
            
        Returns:
            List of projects
        """
        # Enforce maximum limit for performance
        limit = min(limit, 100)
        
        return self.repository.get_all(
            skip=skip,
            limit=limit,
            status=status,
            client_id=client_id
        )
    
    def update_project(
        self,
        project_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        end_date_planned: Optional[date] = None,
        observations: Optional[str] = None,
        estimated_value: Optional[str] = None
    ) -> Project:
        """
        Update project details.
        
        Business Rule: Cannot modify completed/cancelled projects (enforced by domain).
        
        Args:
            project_id: Project to update
            name: New name (optional)
            description: New description (optional)
            end_date_planned: New planned end date (optional)
            observations: New observations (optional)
            estimated_value: New estimated value (optional)
            
        Returns:
            Updated project
            
        Raises:
            ProjectNotFoundError: If project doesn't exist
            BusinessRuleViolationError: If trying to modify immutable project
        """
        # Retrieve existing project
        project = self.get_project(project_id)
        
        # Use domain method to update (enforces business rules)
        project.update_details(
            name=name,
            description=description,
            end_date_planned=end_date_planned,
            observations=observations,
            estimated_value=estimated_value
        )
        
        # Persist changes
        updated_project = self.repository.save(project)
        
        logger.info("project_updated_via_service", project_id=project_id)
        
        return updated_project
    
    def delete_project(self, project_id: int) -> bool:
        """
        Soft delete project.
        
        Args:
            project_id: Project to delete
            
        Returns:
            True if deleted, False if not found
        """
        deleted = self.repository.delete(project_id)
        
        if deleted:
            logger.info("project_deleted_via_service", project_id=project_id)
        
        return deleted
    
    # ========================================
    # Business Operations (Workflows)
    # ========================================
    
    def start_project(self, project_id: int) -> Project:
        """
        Start a project (transition to EM_ANDAMENTO).
        
        Business Rule: Can only start from PLANEJAMENTO or PAUSADO.
        
        Args:
            project_id: Project to start
            
        Returns:
            Updated project
            
        Raises:
            ProjectNotFoundError: If project doesn't exist
            InvalidStateTransitionError: If cannot start from current state
        """
        project = self.get_project(project_id)
        
        # Domain entity enforces state transition rules
        project.start()
        
        # Persist state change
        updated_project = self.repository.save(project)
        
        logger.info(
            "project_started",
            project_id=project_id,
            previous_status=ProjectStatus.PLANEJAMENTO.value
        )
        
        return updated_project
    
    def pause_project(self, project_id: int) -> Project:
        """
        Pause an active project.
        
        Business Rule: Can only pause active projects.
        """
        project = self.get_project(project_id)
        project.pause()
        
        updated_project = self.repository.save(project)
        
        logger.info("project_paused", project_id=project_id)
        
        return updated_project
    
    def complete_project(
        self,
        project_id: int,
        completion_date: Optional[date] = None
    ) -> Project:
        """
        Mark project as completed.
        
        Business Rule: Can only complete active projects.
        
        Args:
            project_id: Project to complete
            completion_date: Actual completion date (defaults to today)
            
        Returns:
            Completed project
        """
        project = self.get_project(project_id)
        project.complete(completion_date)
        
        updated_project = self.repository.save(project)
        
        logger.info(
            "project_completed",
            project_id=project_id,
            duration_days=updated_project.duration_days
        )
        
        return updated_project
    
    def cancel_project(self, project_id: int, reason: Optional[str] = None) -> Project:
        """
        Cancel project.
        
        Business Rule: Cannot cancel completed projects.
        
        Args:
            project_id: Project to cancel
            reason: Cancellation reason (optional)
            
        Returns:
            Cancelled project
        """
        project = self.get_project(project_id)
        project.cancel(reason)
        
        updated_project = self.repository.save(project)
        
        logger.info("project_cancelled", project_id=project_id, reason=reason or "Not specified")
        
        return updated_project
    
    # ========================================
    # Query Operations (Reports/Analytics)
    # ========================================
    
    def get_active_projects(self) -> List[Project]:
        """
        Get all currently active projects.
        
        Returns:
            List of active projects
        """
        return self.repository.get_active_projects()
    
    def get_overdue_projects(self) -> List[Project]:
        """
        Get projects that are past their deadline.
        
        Returns:
            List of overdue projects
        """
        return self.repository.get_overdue_projects()
    
    def get_client_projects(self, client_id: int) -> List[Project]:
        """
        Get all projects for a specific client.
        
        Args:
            client_id: Client identifier
            
        Returns:
            List of client's projects
        """
        return self.repository.get_by_client(client_id)
    
    def get_project_statistics(self) -> dict:
        """
        Get project statistics across all statuses.
        
        Returns:
            Dictionary with counts per status
            
        Use Case: Dashboard widgets, reports
        """
        stats = {}
        
        for status in ProjectStatus:
            stats[status.value] = self.repository.count_by_status(status)
        
        stats["total_active"] = len(self.repository.get_active_projects())
        stats["total_overdue"] = len(self.repository.get_overdue_projects())
        
        logger.info("project_statistics_generated", stats=stats)
        
        return stats


# Service-specific exceptions
class ProjectServiceError(Exception):
    """Base exception for project service operations."""
    pass
