import { Client } from './client.types'

export enum ProjectStatus {
  ACTIVE = 'active',
  ON_HOLD = 'on_hold', 
  COMPLETED = 'completed'
}

export interface Project {
  id: number
  name: string
  description?: string
  client_id: number
  status: ProjectStatus
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface Task {
  id: number
  name: string
  description?: string
  project_id: number
  estimated_hours?: number
  is_active: boolean
  created_at: string
  updated_at: string
  project?: Project
}

// Request types
export interface CreateProjectRequest {
  name: string
  description?: string
  client_id: number
  start_date?: string
  end_date?: string
}

export interface CreateTaskRequest {
  name: string
  description?: string
  project_id: number
  estimated_hours?: number
}