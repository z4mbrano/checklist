"""
Value Objects - Email

Demonstra padrão DDD: Value Object com validação intrínseca.

Características de Value Objects:
1. Imutáveis (frozen=True)
2. Sem identidade (comparação por valor, não por referência)
3. Autovalidação (construtor garante estado válido)
4. Encapsulam conceitos de negócio

Benefício: Impossível criar Email inválido.
"""
from dataclasses import dataclass
import re
from typing import ClassVar


@dataclass(frozen=True)
class Email:
    """
    Value Object representing a validated email address.
    
    Business Rules:
    - Must follow RFC 5322 basic pattern
    - Case-insensitive for comparison
    - Maximum 254 characters
    
    Example:
        >>> email = Email("admin@vrdsolution.com.br")
        >>> print(email.domain)
        'vrdsolution.com.br'
        >>> Email("invalid")  # ← Raises ValueError
    """
    
    value: str
    
    # Regex pattern for basic email validation
    EMAIL_PATTERN: ClassVar[re.Pattern] = re.compile(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    )
    
    def __post_init__(self):
        """Validate email on construction - fail fast principle."""
        if not self.value:
            raise ValueError("Email cannot be empty")
        
        if len(self.value) > 254:
            raise ValueError("Email exceeds maximum length (254 characters)")
        
        if not self.EMAIL_PATTERN.match(self.value):
            raise ValueError(f"Invalid email format: {self.value}")
    
    @property
    def local_part(self) -> str:
        """Get part before @ symbol."""
        return self.value.split('@')[0]
    
    @property
    def domain(self) -> str:
        """Get part after @ symbol."""
        return self.value.split('@')[1]
    
    def __str__(self) -> str:
        """String representation."""
        return self.value
    
    def __eq__(self, other: object) -> bool:
        """Email comparison is case-insensitive."""
        if not isinstance(other, Email):
            return False
        return self.value.lower() == other.value.lower()
    
    def __hash__(self) -> int:
        """Hash for use in sets/dicts."""
        return hash(self.value.lower())


# Example usage in domain entity:
# @dataclass
# class User:
#     id: Optional[int] = None
#     email: Email  # ← Type safety + validation
#     name: str
#     
#     # Now impossible to create user with invalid email:
#     # user = User(email=Email("admin@example.com"), name="Admin")  # ✅ OK
#     # user = User(email=Email("invalid"), name="Admin")  # ❌ ValueError
