"""
Project Repository Interface (Port)

Defines the contract for project persistence without specifying implementation.
This is the "Port" in Hexagonal Architecture - domain defines what it needs.

Architecture Pattern: Repository Pattern + Dependency Inversion Principle
- Domain layer defines the interface (this file)
- Infrastructure layer implements it (sqlalchemy_project_repository.py)
- Services depend on abstraction, not concrete implementation

Benefits:
- Easy to swap persistence layer (SQL → NoSQL → In-Memory)
- Testable with mock repositories
- Domain remains pure and framework-agnostic
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import date

from app.domain.entities.project import Project, ProjectStatus


class IProjectRepository(ABC):
    """
    Repository interface for Project aggregate.
    
    Design Pattern: Repository (DDD)
    - Collection-like interface for domain objects
    - Hides persistence implementation details
    - Returns domain entities, not ORM models
    
    Note: All methods work with domain.entities.Project, NOT models.project.Project
    """
    
    @abstractmethod
    def save(self, project: Project) -> Project:
        """
        Persist a project (create or update).
        
        If project.id is None, creates new record.
        If project.id exists, updates existing record.
        
        Args:
            project: Domain entity to persist
            
        Returns:
            Project with updated id and timestamps
            
        Raises:
            RepositoryError: If persistence fails
        """
        pass
    
    @abstractmethod
    def get_by_id(self, project_id: int) -> Optional[Project]:
        """
        Retrieve project by ID.
        
        Args:
            project_id: Unique project identifier
            
        Returns:
            Project domain entity or None if not found
            
        Note: Excludes soft-deleted records (deleted_at IS NOT NULL)
        """
        pass
    
    @abstractmethod
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[ProjectStatus] = None,
        client_id: Optional[int] = None
    ) -> List[Project]:
        """
        Retrieve projects with optional filtering.
        
        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            status: Filter by project status (optional)
            client_id: Filter by client (optional)
            
        Returns:
            List of project domain entities
            
        Performance Note:
            Should use eager loading for related entities (client, responsible_user)
            to avoid N+1 query problem.
        """
        pass
    
    @abstractmethod
    def get_by_client(self, client_id: int) -> List[Project]:
        """
        Get all projects for a specific client.
        
        Args:
            client_id: Client identifier
            
        Returns:
            List of projects (excludes soft-deleted)
        """
        pass
    
    @abstractmethod
    def get_active_projects(self) -> List[Project]:
        """
        Get all currently active projects (status = EM_ANDAMENTO).
        
        Returns:
            List of active projects
            
        Use Case: Dashboard showing current workload
        """
        pass
    
    @abstractmethod
    def get_overdue_projects(self) -> List[Project]:
        """
        Get projects that are past their planned end date.
        
        Business Query:
            WHERE status = 'em_andamento'
            AND end_date_planned < CURRENT_DATE
            AND deleted_at IS NULL
            
        Returns:
            List of overdue projects
            
        Use Case: Manager dashboard, alerting system
        """
        pass
    
    @abstractmethod
    def delete(self, project_id: int) -> bool:
        """
        Soft delete a project (set deleted_at timestamp).
        
        Business Rule: Soft delete preserves audit trail.
        Hard deletes should never happen in production.
        
        Args:
            project_id: Project to delete
            
        Returns:
            True if deleted, False if not found
        """
        pass
    
    @abstractmethod
    def count_by_status(self, status: ProjectStatus) -> int:
        """
        Count projects in a given status.
        
        Args:
            status: Status to count
            
        Returns:
            Number of projects
            
        Use Case: Analytics, dashboard metrics
        """
        pass
    
    @abstractmethod
    def exists(self, project_id: int) -> bool:
        """
        Check if project exists (not soft-deleted).
        
        Args:
            project_id: Project ID to check
            
        Returns:
            True if exists and not deleted
        """
        pass


class RepositoryError(Exception):
    """Base exception for repository operations."""
    pass


class ProjectNotFoundError(RepositoryError):
    """Raised when project is not found."""
    
    def __init__(self, project_id: int):
        self.project_id = project_id
        super().__init__(f"Project with ID {project_id} not found")


class ProjectAlreadyExistsError(RepositoryError):
    """Raised when attempting to create duplicate project."""
    
    def __init__(self, project_name: str):
        super().__init__(f"Project '{project_name}' already exists")
