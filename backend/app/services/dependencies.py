"""
Dependency Injection Container

Provides factory functions for service and repository instantiation.
FastAPI uses these as dependencies via Depends().

Architecture Pattern: Dependency Injection + Factory Pattern
- Services depend on repository abstractions (IProjectRepository)
- Concrete implementations injected at runtime
- Easy to swap implementations (testing, different databases)
- Single source of truth for object creation

Benefits:
- Testability: Can inject mocks/fakes
- Flexibility: Change implementations without touching business logic
- Lifecycle management: Control when objects are created/destroyed
"""
from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.session import get_db
from app.domain.repositories.project_repository import IProjectRepository
from app.infrastructure.repositories.sqlalchemy_project_repository import SQLAlchemyProjectRepository
from app.services.project_service import ProjectService


# ========================================
# Repository Factories
# ========================================

def get_project_repository(db: Session = Depends(get_db)) -> IProjectRepository:
    """
    Factory for ProjectRepository.
    
    Returns concrete SQLAlchemy implementation, but type hint is the interface.
    This allows swapping implementations without changing dependent code.
    
    Args:
        db: Database session (injected by FastAPI)
        
    Returns:
        IProjectRepository implementation
        
    Lifecycle: Created per request, disposed after request
    """
    return SQLAlchemyProjectRepository(db)


# ========================================
# Service Factories
# ========================================

def get_project_service(
    repository: IProjectRepository = Depends(get_project_repository)
) -> ProjectService:
    """
    Factory for ProjectService.
    
    Injects repository dependency automatically via FastAPI DI system.
    
    Args:
        repository: Project repository (injected automatically)
        
    Returns:
        ProjectService instance
        
    Lifecycle: Created per request
    """
    return ProjectService(repository)


# ========================================
# Future Enhancements
# ========================================

# TODO: Add Unit of Work pattern for transaction management
# def get_unit_of_work(db: Session = Depends(get_db)) -> UnitOfWork:
#     """Factory for Unit of Work (manages transactions across multiple repositories)."""
#     return SQLAlchemyUnitOfWork(db)

# TODO: Add cache layer
# def get_cached_project_service(
#     service: ProjectService = Depends(get_project_service),
#     cache: Redis = Depends(get_redis)
# ) -> CachedProjectService:
#     """Decorator for adding cache to service layer."""
#     return CachedProjectService(service, cache)
