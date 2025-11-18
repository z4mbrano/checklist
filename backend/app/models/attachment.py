"""
Attachment model for file uploads
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Attachment(Base):
    """Attachment model for file uploads associated with checkins."""
    
    __tablename__ = "anexos"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key
    checkin_id = Column(Integer, ForeignKey("checkins.id"), nullable=False, index=True)
    
    # File information
    nome_original = Column(String(255), nullable=False)
    nome_arquivo = Column(String(255), nullable=False, unique=True)  # Generated unique filename
    tipo_arquivo = Column(String(100), nullable=False)  # MIME type
    tamanho = Column(Integer, nullable=False)  # File size in bytes
    
    # File path
    caminho_arquivo = Column(String(500), nullable=False)  # Relative path to file
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True))  # For soft delete
    
    # Relationships
    checkin = relationship("Checkin", back_populates="anexos")
    
    def __repr__(self):
        return f"<Attachment(id={self.id}, nome_original='{self.nome_original}', checkin_id={self.checkin_id})>"
    
    @property
    def tamanho_formatado(self) -> str:
        """Return formatted file size."""
        if self.tamanho < 1024:
            return f"{self.tamanho} B"
        elif self.tamanho < 1024 * 1024:
            return f"{self.tamanho / 1024:.1f} KB"
        else:
            return f"{self.tamanho / (1024 * 1024):.1f} MB"
    
    @property
    def is_image(self) -> bool:
        """Check if attachment is an image."""
        image_types = ["image/jpeg", "image/png", "image/gif", "image/bmp"]
        return self.tipo_arquivo in image_types
    
    @property
    def is_document(self) -> bool:
        """Check if attachment is a document."""
        doc_types = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
        return self.tipo_arquivo in doc_types