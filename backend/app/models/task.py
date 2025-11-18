"""
Task and TaskCategory models for task management
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class TaskCategory(Base):
    """Task category model for organizing tasks."""
    
    __tablename__ = "categorias_tarefas"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic category information
    nome = Column(String(100), nullable=False, unique=True, index=True)
    descricao = Column(Text)
    cor = Column(String(7), default="#3498db")  # Hex color code
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))  # For soft delete
    
    # Relationships
    tarefas = relationship("Task", back_populates="categoria")
    
    def __repr__(self):
        return f"<TaskCategory(id={self.id}, nome='{self.nome}')>"


class Task(Base):
    """Task model representing individual work tasks."""
    
    __tablename__ = "tarefas"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic task information
    nome = Column(String(200), nullable=False, index=True)
    descricao = Column(Text)
    
    # Task details
    tempo_estimado = Column(Integer, default=0)  # in minutes
    
    # Foreign keys
    categoria_id = Column(Integer, ForeignKey("categorias_tarefas.id"), nullable=False, index=True)
    
    # Status
    ativo = Column(Integer, default=1, nullable=False)  # 1=Ativo, 0=Inativo
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))  # For soft delete
    
    # Relationships
    categoria = relationship("TaskCategory", back_populates="tarefas")
    tarefas_executadas = relationship("TarefaExecutada", back_populates="tarefa")
    
    def __repr__(self):
        return f"<Task(id={self.id}, nome='{self.nome}', categoria_id={self.categoria_id})>"
    
    @property
    def is_active(self) -> bool:
        """Check if task is active."""
        return self.ativo == 1 and self.deleted_at is None
    
    @property
    def tempo_estimado_formatted(self) -> str:
        """Return formatted estimated time (HH:MM)."""
        if not self.tempo_estimado:
            return "00:00"
        
        hours = self.tempo_estimado // 60
        minutes = self.tempo_estimado % 60
        return f"{hours:02d}:{minutes:02d}"