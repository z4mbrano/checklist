from datetime import datetime
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.domain.repositories.checkin_repository import CheckinRepository
from app.schemas.checkin import CheckinCreateFull
from app.models.checkin import Checkin, CheckinStatus

class CheckinService:
    def __init__(self, repository: CheckinRepository):
        self.repository = repository

    async def create_full_checkin(self, data: CheckinCreateFull) -> Checkin:
        # Calculate duration
        duration_minutes = int((data.end_time - data.start_time).total_seconds() / 60)
        
        # Format activities into observations if needed
        activities_str = "\nActivities: " + ", ".join(data.activities) if data.activities else ""
        full_observations = (data.observations or "") + activities_str

        checkin = Checkin(
            projeto_id=data.project_id,
            usuario_id=data.user_id,
            data_inicio=data.start_time.date(),
            hora_inicio=data.start_time.time(),
            data_fim=data.end_time.date(),
            hora_fim=data.end_time.time(),
            duracao_minutos=duration_minutes,
            status=CheckinStatus.CONCLUIDO,
            observacoes=full_observations
        )
        
        try:
            return self.repository.create(checkin)
        except IntegrityError as e:
            # Check if it's a foreign key violation for project_id
            error_msg = str(e).lower()
            if "foreign key constraint fails" in error_msg and "projeto_id" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Project with ID {data.project_id} does not exist. Ensure the project is created before submitting the check-in."
                )
            raise e

    async def get_history(self, skip: int = 0, limit: int = 100):
        return self.repository.get_all(skip, limit)
