"""
Audit log model for tracking system changes
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AuditAction(str, enum.Enum):
    """Audit action types."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"


class AuditLog(Base):
    """Audit log model for tracking system changes."""
    
    __tablename__ = "logs_auditoria"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)  # Nullable for system actions
    
    # Action information
    tabela = Column(String(100), nullable=False, index=True)  # Table name affected
    acao = Column(String(50), nullable=False, index=True)  # Action performed
    registro_id = Column(Integer, index=True)  # ID of the affected record
    
    # Data tracking
    dados_antigos = Column(JSON)  # Previous data (for updates)
    dados_novos = Column(JSON)   # New data (for creates/updates)
    
    # Request information
    ip_address = Column(String(45))  # IPv4/IPv6 address
    user_agent = Column(Text)        # Browser/client information
    
    # Additional context
    observacoes = Column(Text)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    usuario = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, tabela='{self.tabela}', acao='{self.acao}', usuario_id={self.usuario_id})>"
    
    @classmethod
    def create_log(cls, 
                   tabela: str, 
                   acao: str, 
                   usuario_id: int = None,
                   registro_id: int = None,
                   dados_antigos: dict = None,
                   dados_novos: dict = None,
                   ip_address: str = None,
                   user_agent: str = None,
                   observacoes: str = None):
        """Create a new audit log entry."""
        return cls(
            tabela=tabela,
            acao=acao,
            usuario_id=usuario_id,
            registro_id=registro_id,
            dados_antigos=dados_antigos,
            dados_novos=dados_novos,
            ip_address=ip_address,
            user_agent=user_agent,
            observacoes=observacoes
        )