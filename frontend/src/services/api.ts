import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = useAuthStore.getState().refreshToken
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          })
          
          const { access_token, user } = response.data
          
          // Update auth store with new token
          useAuthStore.getState().setAuth(user, access_token, refreshToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, logout user
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Service classes
import { 
  Project, Client, Task, Checkin,
  CreateProjectRequest, CreateTaskRequest, 
  CreateCheckinRequest, StartServiceRequest, CheckoutRequest 
} from '@/types'

class ProjectService {
  async getAll(): Promise<Project[]> {
    const response = await api.get('/api/v1/projects/')
    return response.data
  }

  async getById(id: number): Promise<Project> {
    const response = await api.get(`/api/v1/projects/${id}`)
    return response.data
  }

  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await api.post('/api/v1/projects/', data)
    return response.data
  }

  async update(id: number, data: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await api.put(`/api/v1/projects/${id}`, data)
    return response.data
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/projects/${id}`)
  }
}

class ClientService {
  async getAll(): Promise<Client[]> {
    const response = await api.get('/api/v1/clients/')
    return response.data
  }

  async getById(id: number): Promise<Client> {
    const response = await api.get(`/api/v1/clients/${id}`)
    return response.data
  }
}

class TaskService {
  async getByProject(projectId: number): Promise<Task[]> {
    const response = await api.get(`/api/v1/projects/${projectId}/tasks`)
    return response.data
  }

  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await api.post('/api/v1/tasks/', data)
    return response.data
  }
}

class CheckinService {
  // Buscar check-in ativo do usuário
  async getCurrentCheckin(): Promise<Checkin | null> {
    try {
      const response = await api.get('/api/v1/checkins/current')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  // Check-in de chegada no cliente
  async arrival(data: CreateCheckinRequest): Promise<Checkin> {
    const response = await api.post('/api/v1/checkins/arrival', data)
    return response.data
  }

  // Check-in de início de serviço
  async startService(data: StartServiceRequest): Promise<Checkin> {
    const response = await api.post('/api/v1/checkins/start-service', data)
    return response.data
  }

  // Check-out com atividades e observações
  async checkout(data: CheckoutRequest): Promise<Checkin> {
    const response = await api.post('/api/v1/checkins/checkout', data)
    return response.data
  }

  // Histórico de check-ins
  async getHistory(page: number = 1, size: number = 10): Promise<{ items: Checkin[], total: number }> {
    const response = await api.get(`/api/v1/checkins/`, {
      params: { page, size }
    })
    return response.data
  }
}

// Export service instances
export const projectService = new ProjectService()
export const clientService = new ClientService()
export const taskService = new TaskService()
export const checkinService = new CheckinService()