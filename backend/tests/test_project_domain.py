"""
Unit Tests - Project Domain Entity

Demonstra DDD Test Pattern: Testes do domínio SEM infraestrutura.

Benefícios:
✅ Testes rápidos (sem banco de dados)
✅ Testes isolados (sem SQLAlchemy)
✅ Testes focados em regras de negócio
✅ Fácil de debugar (sem setup complexo)

Para rodar:
    pytest tests/test_project_domain.py -v
"""
import pytest
from datetime import date, datetime, timedelta
from app.domain.entities.project import (
    Project, 
    ProjectStatus, 
    InvalidStateTransitionError,
    BusinessRuleViolationError
)


class TestProjectCreation:
    """Test project instantiation and initial state."""
    
    def test_create_project_with_required_fields(self):
        """Should create project with minimal required data."""
        project = Project(
            name="Cloud Migration",
            client_id=1
        )
        
        assert project.name == "Cloud Migration"
        assert project.client_id == 1
        assert project.status == ProjectStatus.PLANEJAMENTO
        assert project.id is None  # Not persisted yet
    
    def test_create_project_with_all_fields(self):
        """Should create project with complete data."""
        start = date(2025, 1, 1)
        end_planned = date(2025, 12, 31)
        
        project = Project(
            id=1,
            name="Cloud Migration",
            description="AWS to Azure migration",
            status=ProjectStatus.EM_ANDAMENTO,
            client_id=1,
            responsible_user_id=5,
            start_date=start,
            end_date_planned=end_planned,
            estimated_value="R$ 50.000"
        )
        
        assert project.id == 1
        assert project.description == "AWS to Azure migration"
        assert project.responsible_user_id == 5
        assert project.start_date == start
        assert project.end_date_planned == end_planned
        assert project.estimated_value == "R$ 50.000"


class TestProjectStateTransitions:
    """Test business logic for state changes."""
    
    def test_start_project_from_planning(self):
        """Should transition from PLANEJAMENTO to EM_ANDAMENTO."""
        project = Project(name="Test", client_id=1)
        assert project.status == ProjectStatus.PLANEJAMENTO
        
        project.start()
        
        assert project.status == ProjectStatus.EM_ANDAMENTO
    
    def test_start_already_started_project_fails(self):
        """Cannot start an already completed project."""
        project = Project(
            name="Test", 
            client_id=1,
            status=ProjectStatus.CONCLUIDO
        )
        
        with pytest.raises(InvalidStateTransitionError):
            project.start()
    
    def test_pause_active_project(self):
        """Should pause EM_ANDAMENTO project."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        project.pause()
        
        assert project.status == ProjectStatus.PAUSADO
    
    def test_cannot_pause_completed_project(self):
        """Business rule: Cannot pause completed project."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.CONCLUIDO
        )
        
        with pytest.raises(InvalidStateTransitionError, match="EM_ANDAMENTO"):
            project.pause()
    
    def test_complete_project(self):
        """Should mark project as completed with completion date."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        project.complete()
        
        assert project.status == ProjectStatus.CONCLUIDO
        assert project.end_date_actual is not None
    
    def test_cancel_project(self):
        """Should cancel project from any non-completed status."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        project.cancel("Budget cut")
        
        assert project.status == ProjectStatus.CANCELADO
        assert "Budget cut" in project.observations


class TestProjectBusinessLogic:
    """Test domain behavior methods."""
    
    def test_is_active_for_in_progress_project(self):
        """EM_ANDAMENTO projects should be active."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        assert project.is_active is True
    
    def test_is_active_for_paused_project(self):
        """PAUSADO projects should NOT be active."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.PAUSADO
        )
        
        assert project.is_active is False
    
    def test_is_active_for_completed_project(self):
        """CONCLUIDO projects should NOT be active."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.CONCLUIDO
        )
        
        assert project.is_active is False
    
    def test_is_overdue_with_no_deadline(self):
        """Projects without end_date_planned cannot be overdue."""
        project = Project(
            name="Test",
            client_id=1,
            end_date_planned=None,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        assert project.is_overdue is False
    
    def test_is_overdue_with_future_deadline(self):
        """Project with future end_date_planned is not overdue."""
        future = date.today() + timedelta(days=30)
        project = Project(
            name="Test",
            client_id=1,
            end_date_planned=future,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        assert project.is_overdue is False
    
    def test_is_overdue_with_past_deadline(self):
        """Active project with past end_date_planned IS overdue."""
        past = date.today() - timedelta(days=1)
        start = date.today() - timedelta(days=30)  # Started before deadline
        project = Project(
            name="Test",
            client_id=1,
            start_date=start,
            end_date_planned=past,
            status=ProjectStatus.EM_ANDAMENTO
        )
        
        assert project.is_overdue is True
    
    def test_completed_project_not_overdue(self):
        """Completed projects are never overdue (even if late)."""
        past = date.today() - timedelta(days=30)
        start = date.today() - timedelta(days=60)  # Started before deadline
        project = Project(
            name="Test",
            client_id=1,
            start_date=start,
            end_date_planned=past,
            status=ProjectStatus.CONCLUIDO
        )
        
        assert project.is_overdue is False
    
    def test_duration_days_with_completion(self):
        """Should calculate duration when completed."""
        start = date(2025, 1, 1)
        end = date(2025, 1, 11)  # 10 days later
        
        project = Project(
            name="Test",
            client_id=1,
            start_date=start,
            end_date_actual=end
        )
        
        assert project.duration_days == 10
    
    def test_duration_days_with_no_completion(self):
        """Should return None when project not completed."""
        project = Project(
            name="Test",
            client_id=1,
            start_date=date.today()
        )
        
        assert project.duration_days is None


class TestProjectUpdateDetails:
    """Test update_details method."""
    
    def test_update_name_only(self):
        """Should update only name when provided."""
        project = Project(
            name="Old Name",
            description="Old Description",
            client_id=1
        )
        
        project.update_details(name="New Name")
        
        assert project.name == "New Name"
        assert project.description == "Old Description"  # Unchanged
    
    def test_update_multiple_fields(self):
        """Should update multiple fields simultaneously."""
        project = Project(
            name="Old",
            description="Old",
            client_id=1
        )
        
        new_end_date = date(2025, 12, 31)
        project.update_details(
            name="New",
            description="New",
            end_date_planned=new_end_date,
            estimated_value="R$ 100.000"
        )
        
        assert project.name == "New"
        assert project.description == "New"
        assert project.end_date_planned == new_end_date
        assert project.estimated_value == "R$ 100.000"
    
    def test_update_with_none_values_ignores_them(self):
        """None values should not overwrite existing data."""
        project = Project(
            name="Keep This",
            description="Keep This Too",
            client_id=1
        )
        
        project.update_details(name=None, description="Update Only This")
        
        assert project.name == "Keep This"  # Not changed
        assert project.description == "Update Only This"  # Updated
    
    def test_cannot_update_completed_project(self):
        """Business rule: Cannot modify completed projects."""
        project = Project(
            name="Test",
            client_id=1,
            status=ProjectStatus.CONCLUIDO
        )
        
        with pytest.raises(BusinessRuleViolationError, match="Cannot modify"):
            project.update_details(name="Try to change")


class TestProjectComparison:
    """Test equality and comparison operations."""
    
    def test_projects_equal_by_id(self):
        """Projects with same ID should be equal."""
        p1 = Project(id=1, name="Project A", client_id=1)
        p2 = Project(id=1, name="Project B", client_id=2)  # Different data, same ID
        
        assert p1 == p2
    
    def test_projects_not_equal_different_ids(self):
        """Projects with different IDs should not be equal."""
        p1 = Project(id=1, name="Same", client_id=1)
        p2 = Project(id=2, name="Same", client_id=1)
        
        assert p1 != p2
    
    def test_unsaved_projects_not_equal(self):
        """Unsaved projects (no ID) should not be equal."""
        p1 = Project(name="Same", client_id=1)
        p2 = Project(name="Same", client_id=1)
        
        assert p1 != p2


# Running these tests proves domain logic works WITHOUT:
# - Database connection
# - SQLAlchemy ORM
# - FastAPI framework
# - Any infrastructure code
#
# This is the power of Hexagonal Architecture!
