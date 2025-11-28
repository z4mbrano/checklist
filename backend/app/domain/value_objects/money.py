"""
Value Objects - Money

Demonstra padrão DDD: Money type para evitar erros de cálculo.

Problema que resolve:
❌ float: 0.1 + 0.2 = 0.30000000000000004 (imprecisão)
❌ str: "10" + "20" = "1020" (concatenação)
✅ Money: Money(10) + Money(20) = Money(30) (exato)

Características:
1. Usa Decimal para precisão financeira
2. Imutável (frozen=True)
3. Operações matemáticas type-safe
4. Formatação automática para exibição
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


@dataclass(frozen=True)
class Money:
    """
    Value Object representing monetary amount.
    
    Business Rules:
    - Uses Decimal for precision (no float rounding errors)
    - Two decimal places for currency
    - Cannot be negative (business decision - use separate Debt type if needed)
    - Immutable operations (return new Money instances)
    
    Example:
        >>> price = Money(10.99)
        >>> tax = Money(0.50)
        >>> total = price + tax
        >>> print(total)
        'R$ 11.49'
        >>> Money(-5)  # ← Raises ValueError
    """
    
    amount: Decimal
    currency: str = "BRL"
    
    def __init__(self, amount: Union[int, float, str, Decimal], currency: str = "BRL"):
        """
        Create Money from various types.
        
        Args:
            amount: Monetary value (converts to Decimal)
            currency: ISO currency code (default BRL for Brazilian Real)
        """
        # Convert to Decimal and round to 2 decimal places
        decimal_amount = Decimal(str(amount)).quantize(
            Decimal("0.01"), 
            rounding=ROUND_HALF_UP
        )
        
        # Validate
        if decimal_amount < 0:
            raise ValueError("Money amount cannot be negative")
        
        # Bypass frozen dataclass restriction
        object.__setattr__(self, 'amount', decimal_amount)
        object.__setattr__(self, 'currency', currency)
    
    def __add__(self, other: 'Money') -> 'Money':
        """Add two Money values."""
        if not isinstance(other, Money):
            raise TypeError(f"Cannot add Money with {type(other)}")
        if self.currency != other.currency:
            raise ValueError(f"Currency mismatch: {self.currency} vs {other.currency}")
        return Money(self.amount + other.amount, self.currency)
    
    def __sub__(self, other: 'Money') -> 'Money':
        """Subtract Money values."""
        if not isinstance(other, Money):
            raise TypeError(f"Cannot subtract {type(other)} from Money")
        if self.currency != other.currency:
            raise ValueError(f"Currency mismatch: {self.currency} vs {other.currency}")
        result = self.amount - other.amount
        if result < 0:
            raise ValueError("Subtraction would result in negative Money")
        return Money(result, self.currency)
    
    def __mul__(self, multiplier: Union[int, float, Decimal]) -> 'Money':
        """Multiply Money by scalar (e.g., quantity * price)."""
        if isinstance(multiplier, Money):
            raise TypeError("Cannot multiply Money by Money")
        return Money(self.amount * Decimal(str(multiplier)), self.currency)
    
    def __truediv__(self, divisor: Union[int, float, Decimal]) -> 'Money':
        """Divide Money by scalar."""
        if isinstance(divisor, Money):
            raise TypeError("Cannot divide Money by Money")
        if divisor == 0:
            raise ValueError("Cannot divide by zero")
        return Money(self.amount / Decimal(str(divisor)), self.currency)
    
    def __eq__(self, other: object) -> bool:
        """Compare Money values."""
        if not isinstance(other, Money):
            return False
        return self.amount == other.amount and self.currency == other.currency
    
    def __lt__(self, other: 'Money') -> bool:
        """Less than comparison."""
        if not isinstance(other, Money):
            raise TypeError(f"Cannot compare Money with {type(other)}")
        if self.currency != other.currency:
            raise ValueError(f"Currency mismatch: {self.currency} vs {other.currency}")
        return self.amount < other.amount
    
    def __le__(self, other: 'Money') -> bool:
        """Less than or equal comparison."""
        return self < other or self == other
    
    def __str__(self) -> str:
        """Format for display."""
        if self.currency == "BRL":
            return f"R$ {self.amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        return f"{self.currency} {self.amount:,.2f}"
    
    def __repr__(self) -> str:
        """Developer representation."""
        return f"Money({self.amount}, '{self.currency}')"
    
    @property
    def is_zero(self) -> bool:
        """Check if amount is zero."""
        return self.amount == Decimal("0.00")
    
    def to_float(self) -> float:
        """Convert to float (use only for serialization, not calculations)."""
        return float(self.amount)


# Example usage in domain entity:
# @dataclass
# class Project:
#     id: Optional[int] = None
#     name: str
#     budget: Money
#     spent: Money = Money(0)
#     
#     @property
#     def remaining_budget(self) -> Money:
#         """Type-safe calculation."""
#         return self.budget - self.spent
#     
#     @property
#     def is_over_budget(self) -> bool:
#         """Business logic readable."""
#         return self.spent > self.budget
