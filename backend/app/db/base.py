"""
Import all models for Alembic to detect them
"""
from app.core.database import Base
from app.models.user import User
from app.models.client import Client
from app.models.project import Project
from app.models.task import Task, TaskCategory
from app.models.checkin import Checkin, TarefaExecutada
from app.models.attachment import Attachment
from app.models.audit_log import AuditLog

# Export Base for alembic
__all__ = ["Base"]