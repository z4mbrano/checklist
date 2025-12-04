"""
Sprint models for task management within projects
"""
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Enum, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class SprintStatus(str, enum.Enum):
    """Sprint status options."""
    # Values must match database enum values (lowercase)
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Sprint(Base):
    """Sprint model representing a collection of tasks with a deadline."""
    
    __tablename__ = "sprints"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projetos.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    observation = Column(Text, nullable=True)
    # Use values_callable to ensure SQLAlchemy uses the lowercase values from the Enum
    status = Column(Enum(SprintStatus, values_callable=lambda obj: [e.value for e in obj]), default=SprintStatus.PLANNED, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", backref="sprints")
    tasks = relationship("SprintTask", back_populates="sprint", cascade="all, delete-orphan")

class SprintTask(Base):
    """Task model representing an item within a sprint."""
    
    __tablename__ = "sprint_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    sprint = relationship("Sprint", back_populates="tasks")
