from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel
from app.models.sprint import SprintStatus

# --- Task Schemas ---
class SprintTaskBase(BaseModel):
    description: str

class SprintTaskCreate(SprintTaskBase):
    pass

class SprintTaskUpdate(BaseModel):
    is_completed: bool

class SprintTaskResponse(SprintTaskBase):
    id: int
    sprint_id: int
    is_completed: bool
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- Sprint Schemas ---
class SprintBase(BaseModel):
    title: str
    start_date: date
    end_date: date
    observation: Optional[str] = None

class SprintCreate(SprintBase):
    project_id: int
    tasks: List[SprintTaskCreate]

class SprintUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SprintStatus] = None
    observation: Optional[str] = None
    tasks: Optional[List[SprintTaskCreate]] = None # Allow adding new tasks during update

class SprintResponse(SprintBase):
    id: int
    project_id: int
    status: SprintStatus
    created_at: datetime
    tasks: List[SprintTaskResponse]

    class Config:
        from_attributes = True
