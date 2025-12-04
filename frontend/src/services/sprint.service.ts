import { api } from './api';
import { Sprint, CreateSprint, UpdateSprintStatus, UpdateSprintTask } from '@/types';

export const sprintService = {
  getAll: async (projectId?: number) => {
    const params = projectId ? { project_id: projectId } : {};
    const response = await api.get<Sprint[]>('/sprints/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Sprint>(`/sprints/${id}`);
    return response.data;
  },

  create: async (data: CreateSprint) => {
    const response = await api.post<Sprint>('/sprints/', data);
    return response.data;
  },

  updateStatus: async (id: number, status: UpdateSprintStatus) => {
    const response = await api.patch<Sprint>(`/sprints/${id}/status`, status);
    return response.data;
  },

  updateTask: async (taskId: number, data: UpdateSprintTask) => {
    const response = await api.patch<Sprint>(`/sprints/tasks/${taskId}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/sprints/${id}`);
  }
};
