from typing import Optional, List, Any
from datetime import datetime, date, time
from pydantic import BaseModel, Field, model_validator, ConfigDict

class CheckinBase(BaseModel):
    pass

class CheckinCreateFull(BaseModel):
    project_id: int
    arrival_time: datetime
    start_time: datetime
    end_time: datetime
    activities: List[str]
    observations: Optional[str] = None
    user_id: Optional[int] = None

class ProjectSummary(BaseModel):
    name: str

class CheckinResponse(BaseModel):
    id: int
    project_id: int = Field(..., validation_alias='projeto_id', serialization_alias='project_id')
    user_id: int = Field(..., validation_alias='usuario_id', serialization_alias='user_id')
    created_at: datetime
    
    # Computed fields
    arrival_time: Optional[datetime] = None
    start_time: Optional[datetime] = None
    checkout_time: Optional[datetime] = None
    total_hours: Optional[float] = None
    observations: Optional[str] = Field(None, validation_alias='observacoes')
    status: str
    
    project: Optional[ProjectSummary] = None
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @model_validator(mode='before')
    @classmethod
    def from_orm_model(cls, data: Any) -> Any:
        # Check if it's an SQLAlchemy model (has __table__ or similar, or just check attributes)
        if hasattr(data, 'data_inicio'): 
            # Construct datetimes
            start_dt = None
            if data.data_inicio and data.hora_inicio:
                start_dt = datetime.combine(data.data_inicio, data.hora_inicio)
            
            end_dt = None
            if data.data_fim and data.hora_fim:
                end_dt = datetime.combine(data.data_fim, data.hora_fim)
            
            # Calculate total hours
            total_hours = 0
            if data.duracao_minutos:
                total_hours = data.duracao_minutos / 60.0
            
            # Map project
            project_data = None
            if hasattr(data, 'projeto') and data.projeto:
                project_data = {"name": data.projeto.nome}
            
            return {
                "id": data.id,
                "project_id": data.projeto_id,
                "user_id": data.usuario_id,
                "created_at": data.created_at,
                "arrival_time": start_dt, # Mapping start to arrival as fallback
                "start_time": start_dt,
                "checkout_time": end_dt,
                "total_hours": total_hours,
                "observations": data.observacoes,
                "status": data.status.value if hasattr(data.status, 'value') else data.status,
                "project": project_data
            }
        return data

class CheckinListResponse(BaseModel):
    items: List[CheckinResponse]
    total: int

