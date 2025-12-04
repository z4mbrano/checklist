// Re-export all types from individual modules
export * from './auth.types'
export * from './client.types'
export * from './project.types'
export * from './checkin.types'
export * from './sprint.types'

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
}

// Error response
export interface ApiError {
  detail: string | { [key: string]: string[] }
}