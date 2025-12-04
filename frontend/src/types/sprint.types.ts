export enum SprintStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface SprintTask {
  id: number;
  sprint_id: number;
  description: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface Sprint {
  id: number;
  project_id: number;
  title: string;
  start_date: string;
  end_date: string;
  observation?: string;
  status: SprintStatus;
  created_at: string;
  tasks: SprintTask[];
}

export interface CreateSprintTask {
  description: string;
}

export interface CreateSprint {
  project_id: number;
  title: string;
  start_date: string;
  end_date: string;
  observation?: string;
  tasks: CreateSprintTask[];
}

export interface UpdateSprintStatus {
  status: SprintStatus;
}

export interface UpdateSprintTask {
  is_completed: boolean;
}
