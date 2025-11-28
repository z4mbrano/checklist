"""
Integration Tests for Unit of Work Pattern

IMPORTANTE: São testes de INTEGRAÇÃO, não unit tests com mocks!
- Testam fluxo completo: Service → UoW → Repository → Database
- Usam SQLite in-memory (banco real, não mock)
- Validam transações ACID (atomicidade, rollback)

Diferença entre Unit Test e Integration Test:
┌──────────────────┬────────────────────┬──────────────────────┐
│ Aspecto          │ Unit Test          │ Integration Test     │
├──────────────────┼────────────────────┼──────────────────────┤
│ Escopo           │ 1 componente       │ Múltiplos componentes│
│ Database         │ Mock/Fake          │ SQLite in-memory     │
│ Repositories     │ Mock               │ Real implementation  │
│ Velocidade       │ Muito rápido       │ Mais lento           │
│ Confiabilidade   │ Baixa (não testa   │ Alta (testa fluxo    │
│                  │ integração real)   │ end-to-end)          │
└──────────────────┴────────────────────┴──────────────────────┘

Neste arquivo: Integration Tests (banco real, sem mocks)
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.core.unit_of_work import SqlAlchemyUnitOfWork
from app.domain.entities.project import Project, ProjectStatus
from app.domain.value_objects import ProjectName
from app.models.project import Project as ProjectModel


# ========================================
# Test Database Setup (SQLite in-memory)
# ========================================

@pytest.fixture(scope="function")
def test_db_engine():
    """
    Create SQLite in-memory database engine.
    
    Configurações importantes:
    - connect_args={"check_same_thread": False}: Permite uso multi-thread
    - poolclass=StaticPool: Mantém conexão única em memória
    - Scope: function (cada teste tem banco limpo)
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Enable foreign keys in SQLite (disabled by default)
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Cleanup
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def test_session_factory(test_db_engine):
    """Create session factory for test database."""
    return sessionmaker(autocommit=False, autoflush=False, bind=test_db_engine)


@pytest.fixture(scope="function")
def test_uow(test_session_factory):
    """Create Unit of Work instance using test database."""
    return SqlAlchemyUnitOfWork(session_factory=test_session_factory)


@pytest.fixture(scope="function")
def seed_data(test_db_engine):
    """
    Seed test database with required entities (client, user).
    
    Creates minimal data to satisfy foreign key constraints.
    """
    from app.models.client import Client
    from app.models.user import User, UserRole
    from sqlalchemy.orm import sessionmaker
    
    Session = sessionmaker(bind=test_db_engine)
    session = Session()
    
    try:
        # Create client
        client = Client(
            id=1,
            nome="Test Client",
            email="client@test.com",
            is_active=True
        )
        session.add(client)
        
        # Create user
        user = User(
            id=1,
            name="Test User",
            email="user@test.com",
            hashed_password="fake_hash",
            role=UserRole.TECNICO,
            is_active=True
        )
        session.add(user)
        
        session.commit()
    finally:
        session.close()
    
    return {"client_id": 1, "user_id": 1}


# ========================================
# Test 1: Happy Path (Commit Transaction)
# ========================================

def test_uow_commit_saves_project_to_database(test_uow, seed_data):
    """
    Test: Commit persists changes to database.
    
    Scenario:
    1. Create project entity
    2. Save via UoW + commit
    3. Verify data persisted in database
    
    Validates:
    ✅ Context manager works (__enter__/__exit__)
    ✅ Repository save() works
    ✅ Commit persists to database
    ✅ Can read back saved data
    """
    # Arrange
    project_name = ProjectName("Test Project Integration")
    
    # Act: Save project within transaction
    with test_uow as uow:
            # Create domain entity (client_id/responsible_user_id can be NULL for testing)
            project = Project(
                name=project_name,
                client_id=seed_data["client_id"],
                responsible_user_id=seed_data["user_id"]
            )        # Save via repository
        saved_project = uow.projects.save(project)
        
        # Commit transaction
        uow.commit()
        
        # Store ID for verification
        project_id = saved_project.id
    
    # Assert: Verify data persisted
    with test_uow as uow:
        # Read from database
        retrieved_project = uow.projects.get_by_id(project_id)
        
        assert retrieved_project is not None
        assert retrieved_project.name.value == "Test Project Integration"
        assert retrieved_project.status == ProjectStatus.ACTIVE
        assert retrieved_project.client_id == 1


# ========================================
# Test 2: Rollback on Exception
# ========================================

def test_uow_rollback_on_exception(test_uow, seed_data):
    """
    Test: Exception triggers automatic rollback.
    
    Scenario:
    1. Start transaction
    2. Save project
    3. Raise exception BEFORE commit
    4. Verify data NOT persisted (rollback)
    
    Validates:
    ✅ Automatic rollback in __exit__ when exception occurs
    ✅ Database remains unchanged after rollback
    ✅ Transaction isolation (uncommitted data not visible)
    """
    # Act: Transaction with exception
    with pytest.raises(ValueError):
        with test_uow as uow:
            # Create and save project
            project = Project(
                name=ProjectName("Project Should Not Exist"),
                client_id=seed_data["client_id"],
                responsible_user_id=seed_data["user_id"]
            )
            saved_project = uow.projects.save(project)
            project_id = saved_project.id
            
            # Simulate business logic error BEFORE commit
            raise ValueError("Simulated error - should rollback")
            
            # This commit will never execute
            uow.commit()  # pragma: no cover
    
    # Assert: Verify rollback (project not in database)
    with test_uow as uow:
        # Should return None (project was rolled back)
        retrieved_project = uow.projects.get_by_id(project_id)
        assert retrieved_project is None


# ========================================
# Test 3: Manual Rollback
# ========================================

def test_uow_manual_rollback(test_uow, seed_data):
    """
    Test: Manual rollback discards changes.
    
    Scenario:
    1. Save project
    2. Call rollback() manually
    3. Verify data NOT persisted
    
    Validates:
    ✅ Manual rollback() works
    ✅ Can control transaction flow explicitly
    """
    # Act: Manual rollback
    with test_uow as uow:
        project = Project(
            name=ProjectName("Rollback Test"),
            client_id=seed_data["client_id"],
            responsible_user_id=seed_data["user_id"]
        )
        saved_project = uow.projects.save(project)
        project_id = saved_project.id
        
        # Manual rollback (discard changes)
        uow.rollback()
    
    # Assert: Project not in database
    with test_uow as uow:
        assert uow.projects.get_by_id(project_id) is None


# ========================================
# Test 4: Multiple Operations (Atomicity)
# ========================================

def test_uow_atomicity_multiple_operations(test_uow, seed_data):
    """
    Test: Multiple operations are atomic (ALL or NOTHING).
    
    Scenario:
    1. Create 3 projects
    2. Save all
    3. Commit once
    4. Verify all 3 persisted
    
    Validates:
    ✅ Multiple operations in same transaction
    ✅ Single commit saves everything
    ✅ Atomicity (all-or-nothing)
    """
    # Act: Multiple operations in one transaction
    project_ids = []
    
    with test_uow as uow:
        for i in range(3):
            project = Project(
                name=ProjectName(f"Project {i+1}"),
                client_id=seed_data["client_id"],
                responsible_user_id=seed_data["user_id"]
            )
            saved = uow.projects.save(project)
            project_ids.append(saved.id)
        
        # Single commit for all operations
        uow.commit()
    
    # Assert: All 3 projects persisted
    with test_uow as uow:
        for project_id in project_ids:
            project = uow.projects.get_by_id(project_id)
            assert project is not None


# ========================================
# Test 5: Partial Failure (Rollback All)
# ========================================

def test_uow_partial_failure_rollback_all(test_uow, seed_data):
    """
    Test: Failure in middle of transaction rolls back EVERYTHING.
    
    Scenario:
    1. Save project 1 (success)
    2. Save project 2 (success)
    3. Raise exception
    4. Verify BOTH projects rolled back (not just second)
    
    Validates:
    ✅ ALL-or-NOTHING guarantee
    ✅ Partial commits não acontecem
    ✅ Transaction isolation
    """
    # Act: Partial failure
    project_ids = []
    
    with pytest.raises(RuntimeError):
        with test_uow as uow:
            # Save first project
            project1 = Project(
                name=ProjectName("Project 1"),
                client_id=seed_data["client_id"],
                responsible_user_id=seed_data["user_id"]
            )
            saved1 = uow.projects.save(project1)
            project_ids.append(saved1.id)
            
            # Save second project
            project2 = Project(
                name=ProjectName("Project 2"),
                client_id=seed_data["client_id"],
                responsible_user_id=seed_data["user_id"]
            )
            saved2 = uow.projects.save(project2)
            project_ids.append(saved2.id)
            
            # Simulate failure BEFORE commit
            raise RuntimeError("Operation failed - rollback both")
            
            uow.commit()  # pragma: no cover
    
    # Assert: BOTH projects rolled back (atomicity)
    with test_uow as uow:
        assert uow.projects.get_by_id(project_ids[0]) is None
        assert uow.projects.get_by_id(project_ids[1]) is None


# ========================================
# Test 6: Repository Sharing Same Session
# ========================================

def test_uow_repositories_share_same_session(test_uow, seed_data):
    """
    Test: All repositories in UoW share same SQLAlchemy session.
    
    Scenario:
    1. Save project via uow.projects
    2. Retrieve via uow.projects (same UoW instance)
    3. Verify same session (identity check)
    
    Validates:
    ✅ Lazy loading of repositories
    ✅ Session sharing (transaction isolation)
    ✅ SQLAlchemy identity map works
    """
    with test_uow as uow:
        # Create and save
        project = Project(
            name=ProjectName("Session Test"),
            client_id=seed_data["client_id"],
            responsible_user_id=seed_data["user_id"]
        )
        saved = uow.projects.save(project)
        project_id = saved.id
        
        # Retrieve from same session
        retrieved = uow.projects.get_by_id(project_id)
        
        # Should be SAME Python object (SQLAlchemy identity map)
        assert saved is retrieved
        assert id(saved) == id(retrieved)


# ========================================
# Test 7: Update and Delete Operations
# ========================================

def test_uow_update_and_delete_operations(test_uow, seed_data):
    """
    Test: Update and delete operations work with UoW.
    
    Scenario:
    1. Create project
    2. Update name
    3. Commit
    4. Verify update persisted
    5. Delete project
    6. Commit
    7. Verify deletion persisted
    
    Validates:
    ✅ Update operations
    ✅ Delete operations
    ✅ State changes tracked by SQLAlchemy session
    """
    # Step 1: Create project
    with test_uow as uow:
        project = Project(
            name=ProjectName("Original Name"),
            client_id=seed_data["client_id"],
            responsible_user_id=seed_data["user_id"]
        )
        saved = uow.projects.save(project)
        project_id = saved.id
        uow.commit()
    
    # Step 2: Update name
    with test_uow as uow:
        project = uow.projects.get_by_id(project_id)
        project.name = ProjectName("Updated Name")
        uow.projects.save(project)
        uow.commit()
    
    # Step 3: Verify update
    with test_uow as uow:
        project = uow.projects.get_by_id(project_id)
        assert project.name.value == "Updated Name"
    
    # Step 4: Delete project
    with test_uow as uow:
        uow.projects.delete(project_id)
        uow.commit()
    
    # Step 5: Verify deletion
    with test_uow as uow:
        assert uow.projects.get_by_id(project_id) is None


# ========================================
# Test 8: Flush without Commit
# ========================================

def test_uow_flush_without_commit(test_uow, seed_data):
    """
    Test: Flush generates IDs without committing.
    
    Scenario:
    1. Save project
    2. Flush (get ID)
    3. Do NOT commit
    4. Exit context (rollback)
    5. Verify data NOT persisted
    
    Validates:
    ✅ flush() generates auto-increment IDs
    ✅ flush() does NOT commit
    ✅ Changes visible within transaction only
    """
    project_id = None
    
    with test_uow as uow:
        project = Project(
            name=ProjectName("Flush Test"),
            client_id=seed_data["client_id"],
            responsible_user_id=seed_data["user_id"]
        )
        saved = uow.projects.save(project)
        
        # Flush to get ID (but don't commit)
        uow.flush()
        project_id = saved.id
        
        # ID exists within transaction
        assert project_id is not None
        
        # Do NOT call commit()
        # (automatic rollback in __exit__)
    
    # Verify: Project not persisted (flush != commit)
    with test_uow as uow:
        assert uow.projects.get_by_id(project_id) is None


# ========================================
# Test 9: Error Outside Context Manager
# ========================================

def test_uow_error_when_used_outside_context(test_uow):
    """
    Test: Accessing repository outside context raises error.
    
    Validates:
    ✅ Context manager enforcement
    ✅ Clear error messages
    ✅ Prevents misuse
    """
    # Attempt to access repository outside context
    with pytest.raises(RuntimeError, match="outside UnitOfWork context"):
        _ = test_uow.projects
    
    # Attempt to commit outside context
    with pytest.raises(RuntimeError, match="outside UnitOfWork context"):
        test_uow.commit()
    
    # Attempt to rollback outside context
    with pytest.raises(RuntimeError, match="outside UnitOfWork context"):
        test_uow.rollback()


# ========================================
# Test 10: Service Layer Integration
# ========================================

def test_uow_with_service_layer(test_uow, seed_data):
    """
    Test: UoW works with service layer pattern.
    
    Scenario:
    1. Service method uses UoW
    2. Business logic in service
    3. Repository access via UoW
    4. Single commit at end
    
    Validates:
    ✅ Service → UoW → Repository → DB flow
    ✅ Separation of concerns
    ✅ Transaction management in service layer
    """
    class ProjectService:
        """Example service using UoW."""
        
        def create_project(self, name: str, client_id: int, uow_factory):
            with uow_factory() as uow:
                # Business logic
                project = Project(
                    name=ProjectName(name),
                    client_id=client_id,
                    responsible_user_id=seed_data["user_id"]
                )
                
                # Persist via repository
                saved = uow.projects.save(project)
                
                # Commit transaction
                uow.commit()
                
                return saved.id
    
    # Act: Use service
    service = ProjectService()
    project_id = service.create_project(
        name="Service Layer Test",
        client_id=seed_data["client_id"],
        uow_factory=lambda: test_uow
    )
    
    # Assert: Project persisted
    with test_uow as uow:
        project = uow.projects.get_by_id(project_id)
        assert project is not None
        assert project.name.value == "Service Layer Test"
