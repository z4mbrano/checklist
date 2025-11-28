"""
Value Objects - CPF (Cadastro de Pessoa Física)

Valida e formata CPF brasileiro com dígito verificador.

Algoritmo de Validação:
1. CPF tem 11 dígitos (123.456.789-10)
2. Primeiros 9 dígitos = número base
3. Últimos 2 dígitos = dígitos verificadores (calculados)
4. Rejeita sequências inválidas (111.111.111-11, 000.000.000-00, etc)

Benefício: Impossível criar CPF inválido no sistema.
"""
from dataclasses import dataclass
import re
from typing import ClassVar


@dataclass(frozen=True)
class CPF:
    """
    Value Object representing a validated Brazilian CPF.
    
    Business Rules:
    - Must have exactly 11 digits
    - Must pass mod-11 check digit validation
    - Cannot be sequential (111.111.111-11, etc)
    - Normalized storage (digits only, no formatting)
    
    Example:
        >>> cpf = CPF("123.456.789-10")
        >>> print(cpf.formatted)
        '123.456.789-10'
        >>> print(cpf.value)
        '12345678910'
        >>> CPF("000.000.000-00")  # ← Raises ValueError (invalid)
        >>> CPF("123.456.789-99")  # ← Raises ValueError (wrong check digit)
    """
    
    value: str  # Stored normalized (digits only)
    
    # Invalid CPFs (sequential)
    INVALID_CPFS: ClassVar[set] = {
        "00000000000", "11111111111", "22222222222", "33333333333",
        "44444444444", "55555555555", "66666666666", "77777777777",
        "88888888888", "99999999999"
    }
    
    def __post_init__(self):
        """Validate CPF on construction - fail fast principle."""
        if not self.value:
            raise ValueError("CPF cannot be empty")
        
        # Remove formatting (keep only digits)
        digits_only = re.sub(r'\D', '', self.value)
        
        # Length validation
        if len(digits_only) != 11:
            raise ValueError(f"CPF must have 11 digits (got {len(digits_only)})")
        
        # Check for invalid sequential CPFs
        if digits_only in self.INVALID_CPFS:
            raise ValueError(f"CPF {self.formatted} is invalid (sequential)")
        
        # Validate check digits
        if not self._validate_check_digits(digits_only):
            raise ValueError(f"CPF {self.formatted} has invalid check digits")
        
        # Store normalized version
        object.__setattr__(self, 'value', digits_only)
    
    @staticmethod
    def _validate_check_digits(cpf: str) -> bool:
        """
        Validate CPF check digits using mod-11 algorithm.
        
        Args:
            cpf: CPF with 11 digits (string)
            
        Returns:
            True if check digits are valid
        """
        # Calculate first check digit
        sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digit1 = 0 if sum1 % 11 < 2 else 11 - (sum1 % 11)
        
        if int(cpf[9]) != digit1:
            return False
        
        # Calculate second check digit
        sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digit2 = 0 if sum2 % 11 < 2 else 11 - (sum2 % 11)
        
        return int(cpf[10]) == digit2
    
    @property
    def formatted(self) -> str:
        """
        Get formatted CPF (XXX.XXX.XXX-XX).
        
        Returns:
            Formatted CPF string
        """
        return f"{self.value[:3]}.{self.value[3:6]}.{self.value[6:9]}-{self.value[9:]}"
    
    @property
    def masked(self) -> str:
        """
        Get masked CPF for privacy (XXX.XXX.XXX-XX → ***.456.789-**).
        
        Returns:
            Masked CPF string
        """
        return f"***.{self.value[3:6]}.{self.value[6:9]}-**"
    
    def __str__(self) -> str:
        """String representation (formatted)."""
        return self.formatted
    
    def __repr__(self) -> str:
        """Developer representation."""
        return f"CPF('{self.formatted}')"
    
    def __eq__(self, other: object) -> bool:
        """Equality comparison (by value)."""
        if not isinstance(other, CPF):
            return False
        return self.value == other.value
    
    def __hash__(self) -> int:
        """Hash for use in sets/dicts."""
        return hash(self.value)


# Example usage in domain entity:
# @dataclass
# class User:
#     id: Optional[int] = None
#     name: str
#     cpf: CPF  # ← Type safety + validation + formatting
#     email: Email
#     
#     # Now impossible to create user with invalid CPF:
#     # user = User(name="João", cpf=CPF("123.456.789-10"), email=Email("..."))  # ✅ OK
#     # user = User(name="João", cpf=CPF("000.000.000-00"), email=Email("..."))  # ❌ ValueError
#     # user = User(name="João", cpf=CPF("123.456.789-99"), email=Email("..."))  # ❌ ValueError
