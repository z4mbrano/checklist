from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field
from app.models.project import ProjectStatus
from app.schemas.client import ClientResponse

class ProjectBase(BaseModel):
    name: str = Field(alias="nome")
    description: Optional[str] = Field(None, alias="descricao")
    start_date: date = Field(alias="data_inicio")
    end_date: Optional[date] = Field(None, alias="data_fim_prevista")
    status: ProjectStatus
    client_id: int
    
    class Config:
        populate_by_name = True
        from_attributes = True

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, alias="nome")
    description: Optional[str] = Field(None, alias="descricao")
    start_date: Optional[date] = Field(None, alias="data_inicio")
    status: Optional[ProjectStatus] = None
    
    class Config:
        populate_by_name = True

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    client: Optional[ClientResponse] = None
    client_id: int = Field(validation_alias="cliente_id")

