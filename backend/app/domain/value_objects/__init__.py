"""
Value Objects - Package

Exports all value objects for easy import:
    from app.domain.value_objects import Email, Money
"""

from app.domain.value_objects.email import Email
from app.domain.value_objects.money import Money

__all__ = ["Email", "Money"]
