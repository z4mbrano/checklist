"""
Unit of Work Pattern - Transaction Management

Problema que resolve:
❌ Repositories gerenciam transações individualmente (inconsistência)
❌ Service layer precisa orquestrar commit/rollback manualmente
❌ Difícil garantir atomicidade em operações multi-repository

Solução:
✅ Unit of Work centraliza gerenciamento de transação
✅ Garante ALL or NOTHING (atomicidade ACID)
✅ Simplifica código do Service (sem try/except para rollback)

Architecture Pattern: Unit of Work (Martin Fowler)
- Maintains list of objects affected by transaction
- Coordinates writing out changes (commit)
- Handles rollback on errors
"""
from abc import ABC, abstractmethod
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.logging import get_logger
from app.infrastructure.repositories.sqlalchemy_project_repository import (
    SQLAlchemyProjectRepository
)

logger = get_logger(__name__)


class IUnitOfWork(ABC):
    """
    Unit of Work interface (Port in Hexagonal Architecture).
    
    Defines contract for transaction management.
    Allows swapping SQLAlchemy for other ORMs without changing service layer.
    """
    
    # Repository instances (lazy loaded)
    projects: Any  # Will be IProjectRepository
    # users: Any  # Future: IUserRepository
    # checkins: Any  # Future: ICheckinRepository
    
    @abstractmethod
    def __enter__(self):
        """Enter context manager (begin transaction)."""
        pass
    
    @abstractmethod
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context manager (commit or rollback)."""
        pass
    
    @abstractmethod
    def commit(self):
        """Commit all changes in current transaction."""
        pass
    
    @abstractmethod
    def rollback(self):
        """Rollback all changes in current transaction."""
        pass


class SqlAlchemyUnitOfWork(IUnitOfWork):
    """
    SQLAlchemy implementation of Unit of Work.
    
    Responsibilities:
    1. Manage SQLAlchemy Session lifecycle
    2. Provide access to repositories
    3. Coordinate commit/rollback across all repositories
    4. Ensure transaction isolation (each UoW = 1 transaction)
    
    Usage:
        with SqlAlchemyUnitOfWork() as uow:
            project = uow.projects.get_by_id(1)
            project.start()
            uow.projects.save(project)
            uow.commit()  # ← Atomic commit
        # If exception occurs, automatic rollback
    """
    
    def __init__(self, session_factory=SessionLocal):
        """
        Initialize Unit of Work.
        
        Args:
            session_factory: Factory function to create SQLAlchemy session
                            (default: SessionLocal from database.py)
        """
        self.session_factory = session_factory
        self._session: Optional[Session] = None
        
        # Repository instances (lazy loaded)
        self._projects: Optional[SQLAlchemyProjectRepository] = None
    
    def __enter__(self):
        """
        Enter context manager - begin transaction.
        
        Creates new SQLAlchemy session and initializes repositories.
        """
        self._session = self.session_factory()
        logger.debug("uow_transaction_started", session_id=id(self._session))
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Exit context manager - commit or rollback.
        
        Args:
            exc_type: Exception type (None if no exception)
            exc_val: Exception value
            exc_tb: Exception traceback
            
        Returns:
            False to propagate exception (after rollback)
        """
        if exc_type is not None:
            # Exception occurred - rollback transaction
            logger.warning(
                "uow_transaction_rollback",
                exception_type=exc_type.__name__,
                exception_message=str(exc_val),
                session_id=id(self._session)
            )
            self.rollback()
        else:
            # No exception - commit not called explicitly is OK
            # (some flows may call commit() manually)
            pass
        
        # Always close session
        if self._session:
            self._session.close()
            logger.debug("uow_session_closed", session_id=id(self._session))
            self._session = None
        
        # Return False to propagate exception
        return False
    
    @property
    def projects(self) -> SQLAlchemyProjectRepository:
        """
        Get project repository (lazy loaded).
        
        Returns:
            Project repository instance sharing this UoW's session
        """
        if self._projects is None:
            if self._session is None:
                raise RuntimeError(
                    "Cannot access repository outside UnitOfWork context. "
                    "Use 'with SqlAlchemyUnitOfWork() as uow:' block."
                )
            self._projects = SQLAlchemyProjectRepository(self._session)
        return self._projects
    
    # Future repositories (uncomment when implemented):
    # @property
    # def users(self) -> SQLAlchemyUserRepository:
    #     if self._users is None:
    #         self._users = SQLAlchemyUserRepository(self._session)
    #     return self._users
    #
    # @property
    # def checkins(self) -> SQLAlchemyCheckinRepository:
    #     if self._checkins is None:
    #         self._checkins = SQLAlchemyCheckinRepository(self._session)
    #     return self._checkins
    
    def commit(self):
        """
        Commit all changes in current transaction.
        
        This is the ONLY place where database writes actually happen.
        All repository operations (save, delete) are tracked by SQLAlchemy
        session, but not persisted until commit().
        
        Raises:
            RuntimeError: If called outside context manager
            Exception: Database errors during commit
        """
        if self._session is None:
            raise RuntimeError("Cannot commit outside UnitOfWork context")
        
        try:
            self._session.commit()
            logger.info("uow_transaction_committed", session_id=id(self._session))
        except Exception as e:
            logger.error(
                "uow_commit_failed",
                error=str(e),
                session_id=id(self._session),
                exc_info=True
            )
            self.rollback()
            raise
    
    def rollback(self):
        """
        Rollback all changes in current transaction.
        
        Discards all pending changes tracked by SQLAlchemy session.
        Database state remains unchanged.
        """
        if self._session is None:
            raise RuntimeError("Cannot rollback outside UnitOfWork context")
        
        try:
            self._session.rollback()
            logger.info("uow_transaction_rolledback", session_id=id(self._session))
        except Exception as e:
            logger.error(
                "uow_rollback_failed",
                error=str(e),
                session_id=id(self._session),
                exc_info=True
            )
            raise
    
    def flush(self):
        """
        Flush changes to database without committing.
        
        Useful to get auto-generated IDs before commit.
        Changes are visible within transaction but not to other connections.
        """
        if self._session is None:
            raise RuntimeError("Cannot flush outside UnitOfWork context")
        
        self._session.flush()
        logger.debug("uow_session_flushed", session_id=id(self._session))


# ========================================
# Dependency Injection for FastAPI
# ========================================

def get_unit_of_work() -> SqlAlchemyUnitOfWork:
    """
    Dependency injection function for FastAPI.
    
    Usage in controllers:
        @router.post("/projects")
        async def create_project(
            request: ProjectCreateRequest,
            uow: SqlAlchemyUnitOfWork = Depends(get_unit_of_work)
        ):
            with uow:
                project = Project(name=request.name, ...)
                uow.projects.save(project)
                uow.commit()
            return project
    
    Note: UoW is NOT used as context manager here because FastAPI
    handles it. Service layer should use context manager.
    """
    return SqlAlchemyUnitOfWork()


# ========================================
# Example Usage Patterns
# ========================================

"""
PATTERN 1: Service Layer with UoW (RECOMMENDED)
================================================

class ProjectService:
    def create_project(self, name: str, client_id: int):
        with SqlAlchemyUnitOfWork() as uow:
            # Create domain entity
            project = Project(name=name, client_id=client_id)
            
            # Persist via repository
            saved_project = uow.projects.save(project)
            
            # Commit transaction (atomic)
            uow.commit()
            
            return saved_project
        # If exception occurs, automatic rollback


PATTERN 2: Multi-Repository Transaction (ATOMIC)
=================================================

def transfer_project_ownership(project_id: int, new_user_id: int):
    with SqlAlchemyUnitOfWork() as uow:
        # Fetch project
        project = uow.projects.get_by_id(project_id)
        
        # Fetch new owner
        new_owner = uow.users.get_by_id(new_user_id)
        
        # Business logic
        old_owner_id = project.responsible_user_id
        project.responsible_user_id = new_user_id
        
        # Save changes (both repositories share same transaction)
        uow.projects.save(project)
        uow.users.increment_project_count(new_user_id)
        uow.users.decrement_project_count(old_owner_id)
        
        # Atomic commit (ALL or NOTHING)
        uow.commit()
    # If ANY operation fails, EVERYTHING is rolled back


PATTERN 3: Error Handling with Rollback
========================================

def risky_operation(project_id: int):
    try:
        with SqlAlchemyUnitOfWork() as uow:
            project = uow.projects.get_by_id(project_id)
            
            # Risky operation
            project.start()
            uow.projects.save(project)
            
            # Simulate external API call that might fail
            send_notification(project)  # ← May raise exception
            
            # Only commit if everything succeeded
            uow.commit()
    except Exception as e:
        # Rollback already happened automatically in __exit__
        logger.error("operation_failed", error=str(e))
        raise
"""
