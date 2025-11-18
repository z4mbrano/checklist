import { Project, Task } from './project.types'
import { User } from './auth.types'

export enum CheckinStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export interface Checkin {
  id: number
  user_id: number
  project_id: number
  task_id?: number
  checkin_time: string
  checkout_time?: string
  total_hours?: number
  description?: string
  status: CheckinStatus
  created_at: string
  updated_at: string
  user?: User
  project?: Project
  task?: Task
}

export interface Attachment {
  id: number
  checkin_id: number
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  uploaded_at: string
  checkin?: Checkin
}

// Request types
export interface CreateCheckinRequest {
  project_id: number
  task_id?: number
  description?: string
}

export interface UpdateCheckinRequest {
  task_id?: number
  description?: string
}

export interface CheckoutRequest {
  description?: string
}