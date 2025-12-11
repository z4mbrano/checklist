from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from app.models.sprint import Sprint, SprintTask, SprintStatus
from app.schemas.sprint import SprintCreate, SprintUpdate
from app.core.logging import get_logger

logger = get_logger(__name__)

class SprintService:
    def __init__(self, db: Session):
        self.db = db

    def create_sprint(self, sprint_in: SprintCreate) -> Sprint:
        """Create a new sprint with tasks."""
        try:
            # Create Sprint
            db_sprint = Sprint(
                project_id=sprint_in.project_id,
                title=sprint_in.title,
                start_date=sprint_in.start_date,
                end_date=sprint_in.end_date,
                observation=sprint_in.observation,
                status=SprintStatus.PLANNED
            )
            self.db.add(db_sprint)
            self.db.flush() # Get ID

            # Create Tasks
            for task_in in sprint_in.tasks:
                db_task = SprintTask(
                    sprint_id=db_sprint.id,
                    description=task_in.description
                )
                self.db.add(db_task)
            
            self.db.commit()
            self.db.refresh(db_sprint)
            return db_sprint
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating sprint: {e}")
            raise e

    def get_sprints(self, project_id: Optional[int] = None, status: Optional[SprintStatus] = None) -> List[Sprint]:
        """List sprints with optional filters."""
        query = self.db.query(Sprint).options(joinedload(Sprint.tasks))
        
        if project_id:
            query = query.filter(Sprint.project_id == project_id)
        
        if status:
            query = query.filter(Sprint.status == status)
            
        return query.order_by(Sprint.created_at.desc()).all()

    def get_sprint(self, sprint_id: int) -> Optional[Sprint]:
        """Get sprint by ID."""
        return self.db.query(Sprint).options(joinedload(Sprint.tasks)).filter(Sprint.id == sprint_id).first()

    def update_task_status(self, task_id: int, is_completed: bool) -> Optional[SprintTask]:
        """Update task status and check if sprint is completed."""
        task = self.db.query(SprintTask).filter(SprintTask.id == task_id).first()
        if not task:
            return None
            
        task.is_completed = is_completed
        task.completed_at = datetime.now() if is_completed else None
        
        # Check sprint status
        sprint = task.sprint
        all_tasks = sprint.tasks
        
        if all(t.is_completed for t in all_tasks):
            sprint.status = SprintStatus.COMPLETED
        elif any(t.is_completed for t in all_tasks):
            sprint.status = SprintStatus.IN_PROGRESS
        else:
            sprint.status = SprintStatus.PLANNED
            
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_sprint_status(self, sprint_id: int, status: SprintStatus) -> Optional[Sprint]:
        """Update sprint status manually."""
        sprint = self.get_sprint(sprint_id)
        if not sprint:
            return None
            
        sprint.status = status
        self.db.commit()
        self.db.refresh(sprint)
        return sprint

    def update_sprint(self, sprint_id: int, sprint_update: SprintUpdate) -> Optional[Sprint]:
        """Update sprint details and add new tasks."""
        try:
            sprint = self.get_sprint(sprint_id)
            if not sprint:
                return None
            
            # Update basic fields
            if sprint_update.title is not None:
                sprint.title = sprint_update.title
            if sprint_update.start_date is not None:
                sprint.start_date = sprint_update.start_date
            if sprint_update.end_date is not None:
                sprint.end_date = sprint_update.end_date
            if sprint_update.observation is not None:
                sprint.observation = sprint_update.observation
            if sprint_update.status is not None:
                sprint.status = sprint_update.status
            
            # Add new tasks if provided
            if sprint_update.tasks:
                for task_in in sprint_update.tasks:
                    db_task = SprintTask(
                        sprint_id=sprint.id,
                        description=task_in.description
                    )
                    self.db.add(db_task)
            
            self.db.commit()
            self.db.refresh(sprint)
            return sprint
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating sprint: {e}")
            raise e

    def delete_sprint(self, sprint_id: int) -> bool:
        """Delete a sprint."""
        sprint = self.get_sprint(sprint_id)
        if not sprint:
            return False
            
        try:
            self.db.delete(sprint)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting sprint: {e}")
            return False
