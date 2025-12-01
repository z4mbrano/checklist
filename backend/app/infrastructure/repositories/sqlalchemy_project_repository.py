"""
SQLAlchemy Implementation of Project Repository (Adapter)

Implements IProjectRepository using SQLAlchemy ORM.
This is the "Adapter" in Hexagonal Architecture - adapts domain to infrastructure.

Architecture Pattern: Adapter Pattern + Repository Pattern
- Translates between domain entities and ORM models
- Handles database-specific concerns (transactions, connections)
- Isolated from domain logic

Performance Optimizations:
- Eager loading of relationships to avoid N+1 queries
- Batch operations where possible
- Index-based filtering

Critical: This is the ONLY place where we map between:
- app.domain.entities.project.Project (domain)
- app.models.project.Project (ORM model)
"""
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.domain.repositories.project_repository import (
    IProjectRepository,
    ProjectNotFoundError,
    RepositoryError
)
from app.domain.entities.project import Project as DomainProject, ProjectStatus
from app.models.project import Project as ORMProject
from app.core.logging import get_logger

logger = get_logger(__name__)


class SQLAlchemyProjectRepository(IProjectRepository):
    """
    SQLAlchemy implementation of project repository.
    
    Responsibility: Translate between domain entities and database records.
    Does NOT contain business logic - only persistence logic.
    """
    
    def __init__(self, session: Session):
        """
        Initialize repository with database session.
        
        Args:
            session: SQLAlchemy session (injected via dependency injection)
        """
        self.session = session
    
    # ========================================
    # Private Mapping Methods
    # ========================================
    
    def _to_domain(self, orm_project: ORMProject) -> DomainProject:
        """
        Map ORM model to domain entity.
        
        Architecture Note:
        This translation layer prevents domain from knowing about SQLAlchemy.
        If we switch to MongoDB/DynamoDB, only this method changes.
        
        Args:
            orm_project: SQLAlchemy model instance
            
        Returns:
            Domain entity
        """
        return DomainProject(
            id=orm_project.id,
            name=orm_project.nome,
            description=orm_project.descricao,
            start_date=orm_project.data_inicio,
            end_date_planned=orm_project.data_fim_prevista,
            end_date_actual=orm_project.data_fim_real,
            status=ProjectStatus(orm_project.status.value),  # Enum conversion
            client_id=orm_project.cliente_id,
            responsible_user_id=orm_project.responsavel_id,
            observations=orm_project.observacoes,
            estimated_value=orm_project.valor_estimado,
            created_at=orm_project.created_at,
            updated_at=orm_project.updated_at,
            deleted_at=orm_project.deleted_at
        )
    
    def _to_orm(self, domain_project: DomainProject) -> ORMProject:
        """
        Map domain entity to ORM model.
        
        Used for CREATE operations (new records).
        For UPDATE, use _update_orm() to preserve relationships.
        
        Args:
            domain_project: Domain entity
            
        Returns:
            SQLAlchemy model instance
        """
        # Import here to avoid circular dependency
        from app.models.project import ProjectStatus as ORMProjectStatus
        
        return ORMProject(
            id=domain_project.id,
            nome=domain_project.name.value if hasattr(domain_project.name, 'value') else domain_project.name,
            descricao=domain_project.description,
            data_inicio=domain_project.start_date,
            data_fim_prevista=domain_project.end_date_planned,
            data_fim_real=domain_project.end_date_actual,
            status=ORMProjectStatus(domain_project.status.value),
            cliente_id=domain_project.client_id,
            responsavel_id=domain_project.responsible_user_id,
            observacoes=domain_project.observations,
            valor_estimado=domain_project.estimated_value
        )
    
    def _update_orm(self, orm_project: ORMProject, domain_project: DomainProject) -> None:
        """
        Update existing ORM model with domain entity data.
        
        Preserves relationships and only updates scalar fields.
        
        Args:
            orm_project: Existing SQLAlchemy model
            domain_project: Updated domain entity
        """
        from app.models.project import ProjectStatus as ORMProjectStatus
        
        orm_project.nome = domain_project.name.value if hasattr(domain_project.name, 'value') else domain_project.name
        orm_project.descricao = domain_project.description
        orm_project.data_inicio = domain_project.start_date
        orm_project.data_fim_prevista = domain_project.end_date_planned
        orm_project.data_fim_real = domain_project.end_date_actual
        orm_project.status = ORMProjectStatus(domain_project.status.value)
        orm_project.cliente_id = domain_project.client_id
        orm_project.responsavel_id = domain_project.responsible_user_id
        orm_project.observacoes = domain_project.observations
        orm_project.valor_estimado = domain_project.estimated_value
        orm_project.updated_at = func.now()
    
    # ========================================
    # IProjectRepository Implementation
    # ========================================
    
    def save(self, project: DomainProject) -> DomainProject:
        """Persist project (create or update)."""
        try:
            if project.id is None:
                # CREATE: New project
                orm_project = self._to_orm(project)
                self.session.add(orm_project)
                self.session.commit()  # Commit transaction
                self.session.refresh(orm_project) # Refresh to get generated ID and defaults
                
                logger.info("project_created", project_id=orm_project.id, name=project.name)
                
                # Map back to get generated ID and timestamps
                return self._to_domain(orm_project)
            else:
                # UPDATE: Existing project
                orm_project = self.session.query(ORMProject).filter_by(
                    id=project.id,
                    deleted_at=None
                ).first()
                
                if not orm_project:
                    raise ProjectNotFoundError(project.id)
                
                self._update_orm(orm_project, project)
                self.session.commit() # Commit transaction
                self.session.refresh(orm_project)
                
                logger.info("project_updated", project_id=project.id, name=project.name)
                
                return self._to_domain(orm_project)
                
        except ProjectNotFoundError:
            raise
        except Exception as e:
            logger.error("project_save_failed", error=str(e), exc_info=True)
            raise RepositoryError(f"Failed to save project: {str(e)}") from e
    
    def get_by_id(self, project_id: int) -> Optional[DomainProject]:
        """Retrieve project by ID with eager loading."""
        try:
            orm_project = (
                self.session.query(ORMProject)
                .options(
                    joinedload(ORMProject.client),  # Prevent N+1
                    joinedload(ORMProject.responsavel)
                )
                .filter_by(id=project_id, deleted_at=None)
                .first()
            )
            
            if not orm_project:
                return None
            
            return self._to_domain(orm_project)
            
        except Exception as e:
            logger.error("project_get_failed", project_id=project_id, error=str(e))
            raise RepositoryError(f"Failed to get project: {str(e)}") from e
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[ProjectStatus] = None,
        client_id: Optional[int] = None
    ) -> List[DomainProject]:
        """
        Get projects with filtering and OFFSET pagination.
        
        Note: For large datasets, use get_with_cursor() instead.
        OFFSET pagination degrades with deep pages (O(n) complexity).
        """
        try:
            query = (
                self.session.query(ORMProject)
                .options(
                    joinedload(ORMProject.client),
                    joinedload(ORMProject.responsavel)
                )
                .filter(ORMProject.deleted_at.is_(None))
            )
            
            # Apply filters
            if status:
                from app.models.project import ProjectStatus as ORMProjectStatus
                query = query.filter(ORMProject.status == ORMProjectStatus(status.value))
            
            if client_id:
                query = query.filter(ORMProject.cliente_id == client_id)
            
            # Pagination
            orm_projects = query.offset(skip).limit(limit).all()
            
            return [self._to_domain(p) for p in orm_projects]
            
        except Exception as e:
            logger.error("project_list_failed", error=str(e), exc_info=True)
            raise RepositoryError(f"Failed to list projects: {str(e)}") from e
    
    def get_with_cursor(
        self,
        cursor: Optional[int] = None,
        limit: int = 20,
        status: Optional[ProjectStatus] = None,
        client_id: Optional[int] = None
    ) -> tuple[List[DomainProject], Optional[int]]:
        """
        Get projects with CURSOR-BASED pagination (high performance).
        
        Performance Advantage:
        - No OFFSET (avoids full table scan on deep pages)
        - Uses indexed WHERE clause (id > cursor)
        - O(log n) via index seek vs O(n) via offset scan
        
        Args:
            cursor: Last seen project ID (None for first page)
            limit: Page size (default 20, max 100)
            status: Filter by status
            client_id: Filter by client
            
        Returns:
            Tuple of (projects, next_cursor)
            - projects: List of domain entities
            - next_cursor: ID of last item (for next page) or None if last page
        
        Example:
            # First page
            projects, cursor = repo.get_with_cursor(cursor=None, limit=20)
            
            # Next page
            projects, cursor = repo.get_with_cursor(cursor=cursor, limit=20)
        """
        try:
            query = (
                self.session.query(ORMProject)
                .options(
                    joinedload(ORMProject.client),
                    joinedload(ORMProject.responsavel)
                )
                .filter(ORMProject.deleted_at.is_(None))
            )
            
            # Cursor filtering (keyset pagination)
            if cursor is not None:
                query = query.filter(ORMProject.id > cursor)
            
            # Apply filters
            if status:
                from app.models.project import ProjectStatus as ORMProjectStatus
                query = query.filter(ORMProject.status == ORMProjectStatus(status.value))
            
            if client_id:
                query = query.filter(ORMProject.cliente_id == client_id)
            
            # Order by ID (CRITICAL: must match cursor column)
            query = query.order_by(ORMProject.id)
            
            # Fetch limit + 1 to check if there's a next page
            orm_projects = query.limit(limit + 1).all()
            
            # Determine next cursor
            has_next = len(orm_projects) > limit
            if has_next:
                orm_projects = orm_projects[:limit]  # Trim extra item
                next_cursor = orm_projects[-1].id if orm_projects else None
            else:
                next_cursor = None
            
            domain_projects = [self._to_domain(p) for p in orm_projects]
            
            logger.debug(
                "cursor_pagination_executed",
                cursor=cursor,
                returned_count=len(domain_projects),
                has_next=has_next,
                next_cursor=next_cursor
            )
            
            return domain_projects, next_cursor
            
        except Exception as e:
            logger.error("cursor_pagination_failed", cursor=cursor, error=str(e), exc_info=True)
            raise RepositoryError(f"Failed to paginate projects: {str(e)}") from e
    
    def get_by_client(self, client_id: int) -> List[DomainProject]:
        """Get all projects for a client."""
        return self.get_all(client_id=client_id, limit=1000)
    
    def get_active_projects(self) -> List[DomainProject]:
        """Get currently active projects."""
        return self.get_all(status=ProjectStatus.EM_ANDAMENTO, limit=1000)
    
    def get_overdue_projects(self) -> List[DomainProject]:
        """Get overdue projects (past planned end date and still active)."""
        try:
            from app.models.project import ProjectStatus as ORMProjectStatus
            
            orm_projects = (
                self.session.query(ORMProject)
                .options(
                    joinedload(ORMProject.client),
                    joinedload(ORMProject.responsavel)
                )
                .filter(
                    ORMProject.status == ORMProjectStatus.EM_ANDAMENTO,
                    ORMProject.data_fim_prevista < date.today(),
                    ORMProject.deleted_at.is_(None)
                )
                .all()
            )
            
            return [self._to_domain(p) for p in orm_projects]
            
        except Exception as e:
            logger.error("overdue_projects_query_failed", error=str(e))
            raise RepositoryError(f"Failed to get overdue projects: {str(e)}") from e
    
    def delete(self, project_id: int) -> bool:
        """Soft delete project."""
        try:
            orm_project = self.session.query(ORMProject).filter_by(
                id=project_id,
                deleted_at=None
            ).first()
            
            if not orm_project:
                return False
            
            orm_project.deleted_at = func.now()
            self.session.flush()
            
            logger.info("project_deleted", project_id=project_id)
            return True
            
        except Exception as e:
            logger.error("project_delete_failed", project_id=project_id, error=str(e))
            raise RepositoryError(f"Failed to delete project: {str(e)}") from e
    
    def count_by_status(self, status: ProjectStatus) -> int:
        """Count projects in a status."""
        try:
            from app.models.project import ProjectStatus as ORMProjectStatus
            
            return (
                self.session.query(ORMProject)
                .filter(
                    ORMProject.status == ORMProjectStatus(status.value),
                    ORMProject.deleted_at.is_(None)
                )
                .count()
            )
        except Exception as e:
            logger.error("count_by_status_failed", status=status.value, error=str(e))
            raise RepositoryError(f"Failed to count projects: {str(e)}") from e
    
    def exists(self, project_id: int) -> bool:
        """Check if project exists."""
        return self.get_by_id(project_id) is not None
