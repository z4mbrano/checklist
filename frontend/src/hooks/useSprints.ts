import { useState, useEffect, useCallback } from 'react';
import { sprintService } from '../services/sprint.service';
import { Sprint, SprintTask, CreateSprint, UpdateSprintStatus, UpdateSprintTask } from '../types/sprint.types';

export function useSprints(projectId?: number) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSprints = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sprintService.getAll(projectId);
      setSprints(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sprints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const createSprint = async (data: CreateSprint) => {
    try {
      const newSprint = await sprintService.create(data);
      setSprints(prev => [newSprint, ...prev]);
      return newSprint;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateSprintStatus = async (id: number, status: UpdateSprintStatus) => {
    try {
      const updatedSprint = await sprintService.updateStatus(id, status);
      setSprints(prev => prev.map(s => s.id === id ? updatedSprint : s));
      return updatedSprint;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateSprintTask = async (sprintId: number, taskId: number, data: UpdateSprintTask) => {
    try {
      // Optimistic update
      setSprints(prev => prev.map(s => {
        if (s.id !== sprintId) return s;
        return {
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...data } : t)
        };
      }));

      const updatedTask = await sprintService.updateTask(taskId, data);
      
      // Update with server response
      setSprints(prev => prev.map(s => {
        if (s.id !== sprintId) return s;
        return {
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? updatedTask : t)
        };
      }));
      
      return updatedTask;
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchSprints();
      throw err;
    }
  };

  const deleteSprint = async (id: number) => {
    try {
      await sprintService.delete(id);
      setSprints(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    sprints,
    loading,
    error,
    fetchSprints,
    createSprint,
    updateSprintStatus,
    updateSprintTask,
    deleteSprint
  };
}
