"""
Value Objects - Package

Exports all value objects for easy import:
    from app.domain.value_objects import Email, Money, ProjectName, CPF
"""

from app.domain.value_objects.email import Email
from app.domain.value_objects.money import Money
from app.domain.value_objects.project_name import ProjectName
from app.domain.value_objects.cpf import CPF

__all__ = ["Email", "Money", "ProjectName", "CPF"]
