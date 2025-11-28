"""
Value Objects - ProjectName

Demonstra padrão DDD: Encapsular validações de nome de projeto.

Problema que resolve:
❌ str: Permite nome vazio, excessivamente longo, caracteres inválidos
❌ Validação espalhada: Service, Controller, Model (duplicação)
✅ ProjectName: Validação centralizada no Value Object

Benefício: Impossível criar projeto com nome inválido.
"""
from dataclasses import dataclass
import re
from typing import ClassVar


@dataclass(frozen=True)
class ProjectName:
    """
    Value Object representing a validated project name.
    
    Business Rules:
    - Cannot be empty or whitespace-only
    - Minimum 3 characters
    - Maximum 200 characters
    - Must start with alphanumeric character
    - Can contain letters, numbers, spaces, hyphens, underscores
    
    Example:
        >>> name = ProjectName("Cloud Migration 2025")
        >>> print(name.value)
        'Cloud Migration 2025'
        >>> ProjectName("")  # ← Raises ValueError
        >>> ProjectName("AB")  # ← Raises ValueError (too short)
        >>> ProjectName("x" * 201)  # ← Raises ValueError (too long)
    """
    
    value: str
    
    # Constants
    MIN_LENGTH: ClassVar[int] = 3
    MAX_LENGTH: ClassVar[int] = 200
    PATTERN: ClassVar[re.Pattern] = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9\s\-_\.]*$")
    
    def __post_init__(self):
        """Validate project name on construction - fail fast principle."""
        if not self.value:
            raise ValueError("Project name cannot be empty")
        
        # Trim whitespace
        trimmed = self.value.strip()
        if not trimmed:
            raise ValueError("Project name cannot be whitespace-only")
        
        # Length validation
        if len(trimmed) < self.MIN_LENGTH:
            raise ValueError(
                f"Project name must be at least {self.MIN_LENGTH} characters "
                f"(got {len(trimmed)})"
            )
        
        if len(trimmed) > self.MAX_LENGTH:
            raise ValueError(
                f"Project name cannot exceed {self.MAX_LENGTH} characters "
                f"(got {len(trimmed)})"
            )
        
        # Pattern validation
        if not self.PATTERN.match(trimmed):
            raise ValueError(
                "Project name must start with alphanumeric character and "
                "contain only letters, numbers, spaces, hyphens, underscores, dots"
            )
        
        # Update value with trimmed version (bypass frozen restriction)
        object.__setattr__(self, 'value', trimmed)
    
    @property
    def length(self) -> int:
        """Get name length."""
        return len(self.value)
    
    @property
    def initials(self) -> str:
        """
        Get project initials (first letter of each word).
        
        Example:
            ProjectName("Cloud Migration Project") → "CMP"
        """
        words = self.value.split()
        return ''.join(word[0].upper() for word in words if word)
    
    def contains(self, substring: str, case_sensitive: bool = False) -> bool:
        """Check if name contains substring."""
        if case_sensitive:
            return substring in self.value
        return substring.lower() in self.value.lower()
    
    def __str__(self) -> str:
        """String representation."""
        return self.value
    
    def __repr__(self) -> str:
        """Developer representation."""
        return f"ProjectName('{self.value}')"
    
    def __len__(self) -> int:
        """Support len() function."""
        return len(self.value)


# Example usage in domain entity:
# @dataclass
# class Project:
#     id: Optional[int] = None
#     name: ProjectName  # ← Type safety + validation
#     description: Optional[str] = None
#     
#     # Now impossible to create project with invalid name:
#     # project = Project(name=ProjectName("Valid Name"))  # ✅ OK
#     # project = Project(name=ProjectName(""))  # ❌ ValueError
#     # project = Project(name=ProjectName("AB"))  # ❌ ValueError (too short)
