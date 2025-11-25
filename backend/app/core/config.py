"""
Application Configuration Settings
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    db_host: str
    db_user: str
    db_password: str
    db_name: str
    db_port: int = 3306
    
    @property
    def database_url(self) -> str:
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    test_database_url: str = "sqlite:///./test_checklist.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Security
    secret_key: str = secrets.token_urlsafe(32)
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"
    
    # CORS - Allow frontend origins
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]
    
    # File Upload
    upload_dir: str = "./uploads"
    max_file_size: int = 10485760  # 10MB
    allowed_file_types: List[str] = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".xls", ".xlsx"]
    
    # Pagination
    default_page_size: int = 20
    max_page_size: int = 100
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # Email (for future use)
    smtp_server: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # API Configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Check-in System API"
    version: str = "1.0.0"
    description: str = "Sistema de Check-in/Check-out para Técnicos - API"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()