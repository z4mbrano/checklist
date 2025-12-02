"""
Common schemas used across the application
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime


class PaginationParams(BaseModel):
    """Pagination parameters schema."""
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")


class PaginatedResponse(BaseModel):
    """Paginated response schema."""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(cls, items: List[Any], total: int, page: int, size: int):
        """Create paginated response."""
        pages = (total + size - 1) // size  # Calculate total pages
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )


class DateRangeFilter(BaseModel):
    """Date range filter schema."""
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None


class SearchFilter(BaseModel):
    """Search filter schema."""
    search: Optional[str] = Field(None, description="Search term")


class StatusFilter(BaseModel):
    """Status filter schema."""
    status: Optional[str] = Field(None, description="Status filter")


class MessageResponse(BaseModel):
    """Generic message response schema."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SearchItemResponse(BaseModel):
    """
    Minimal DTO for autocomplete/search results.
    Always returns id and name in a consistent format.
    """
    id: int
    name: str
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )
