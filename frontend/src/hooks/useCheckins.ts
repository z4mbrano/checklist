/**
 * React Query Custom Hooks - Checkins
 * 
 * Benefits:
 * - Intelligent pagination & infinite scroll support
 * - Real-time sync with server
 * - Optimistic updates for instant UX
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkinService } from '@/services/api'
import { Checkin } from '@/types/mobile'
import { CreateCheckinRequest } from '@/types/checkin.types'
import { CheckinMapper } from '@/mappers/dataMappers'
import { logger } from '@/utils/logger'
import toast from 'react-hot-toast'

/**
 * Query Keys
 */
export const checkinKeys = {
  all: ['checkins'] as const,
  lists: () => [...checkinKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => 
    [...checkinKeys.lists(), { page, limit }] as const,
  byProject: (projectId: string) => 
    [...checkinKeys.all, 'project', projectId] as const
}

/**
 * Fetch checkin history with pagination
 */
export function useCheckins(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: checkinKeys.list(page, limit),
    queryFn: async (): Promise<Checkin[]> => {
      try {
        const response = await checkinService.getHistory(page, limit)
        return CheckinMapper.toDomainList(response.items)
      } catch (error) {
        logger.error('Failed to fetch checkins', error as Error, { page, limit })
        throw error
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (checkins change frequently)
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true
  })
}

/**
 * Fetch checkins for specific project
 */
export function useProjectCheckins(projectId: string) {
  return useQuery({
    queryKey: checkinKeys.byProject(projectId),
    queryFn: async (): Promise<Checkin[]> => {
      try {
        // Assuming API supports filtering by project
        const response = await checkinService.getHistory(1, 100)
        const allCheckins = CheckinMapper.toDomainList(response.items)
        return allCheckins.filter(c => c.projectId === projectId)
      } catch (error) {
        logger.error('Failed to fetch project checkins', error as Error, { projectId })
        throw error
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2
  })
}

/**
 * Create checkin with optimistic update
 */
export function useCreateCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCheckin: CreateCheckinRequest): Promise<Checkin> => {
      const apiCheckin = await checkinService.createFull(newCheckin)
      return CheckinMapper.toDomain(apiCheckin)
    },

    onMutate: async (newCheckin) => {
      await queryClient.cancelQueries({ queryKey: checkinKeys.lists() })

      const previousCheckins = queryClient.getQueryData<Checkin[]>(
        checkinKeys.list(1, 20)
      )

      // Optimistic checkin
      if (previousCheckins) {
        const optimisticCheckin: Checkin = {
          id: `temp-${Date.now()}`,
          projectId: String(newCheckin.project_id),
          projectName: 'Carregando...',
          arrivalTime: new Date().toISOString(),
          startTime: new Date().toISOString(),
          endTime: undefined,
          totalHours: undefined,
          activities: [],
          otherActivities: undefined,
          date: new Date().toISOString(),
          userEmail: ''
        }

        queryClient.setQueryData<Checkin[]>(
          checkinKeys.list(1, 20),
          [optimisticCheckin, ...previousCheckins]
        )
      }

      return { previousCheckins }
    },

    onError: (error, _variables, context) => {
      if (context?.previousCheckins) {
        queryClient.setQueryData(checkinKeys.list(1, 20), context.previousCheckins)
      }

      logger.error('Failed to create checkin', error as Error)
      toast.error('Erro ao criar checkin')
    },

    onSuccess: (newCheckin) => {
      // Invalidate all checkin queries
      queryClient.invalidateQueries({ queryKey: checkinKeys.all })
      
      // Also invalidate project cache (checkin count may change)
      queryClient.invalidateQueries({ queryKey: ['projects'] })

      logger.info('Checkin created successfully', { checkinId: newCheckin.id })
      toast.success('Checkin registrado!')
    }
  })
}

/**
 * Update checkin (Not implemented in API yet)
 */
export function useUpdateCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string
      updates: Partial<CreateCheckinRequest>
    }): Promise<Checkin> => {
      // TODO: Implement update endpoint in CheckinService
      throw new Error('Update checkin not implemented in API yet')
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.all })
      toast.success('Checkin atualizado!')
    },

    onError: (error) => {
      logger.error('Failed to update checkin', error as Error)
      toast.error('Erro ao atualizar checkin')
    }
  })
}

/**
 * Delete checkin (Not implemented in API yet)
 */
export function useDeleteCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (checkinId: string) => {
      // TODO: Implement delete endpoint in CheckinService
      throw new Error('Delete checkin not implemented in API yet')
    },

    onMutate: async (checkinId) => {
      await queryClient.cancelQueries({ queryKey: checkinKeys.lists() })

      const previousCheckins = queryClient.getQueryData<Checkin[]>(
        checkinKeys.list(1, 20)
      )

      if (previousCheckins) {
        queryClient.setQueryData<Checkin[]>(
          checkinKeys.list(1, 20),
          previousCheckins.filter(c => c.id !== checkinId)
        )
      }

      return { previousCheckins }
    },

    onError: (error, _variables, context) => {
      if (context?.previousCheckins) {
        queryClient.setQueryData(checkinKeys.list(1, 20), context.previousCheckins)
      }

      logger.error('Failed to delete checkin', error as Error)
      toast.error('Erro ao excluir checkin')
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.all })
      toast.success('Checkin excluído!')
    }
  })
}
