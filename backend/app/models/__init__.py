"""
Models package - imports all models for SQLAlchemy relationship resolution
"""
from app.models.user import User, UserRole
from app.models.client import Client
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskCategory
from app.models.checkin import Checkin, CheckinStatus
from app.models.attachment import Attachment
from app.models.audit_log import AuditLog
from app.models.sprint import Sprint, SprintStatus

__all__ = [
    "User",
    "UserRole",
    "Client",
    "Project",
    "ProjectStatus",
    "Task",
    "TaskCategory",
    "Checkin",
    "CheckinStatus",
    "Attachment",
    "AuditLog",
    "Sprint",
    "SprintStatus"
]
