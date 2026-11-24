import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchRecommendations,
  fetchSavedRecommendations,
  saveRecommendation,
  submitRecommendationFeedback,
  unsaveRecommendation,
} from '../api/recommendations'
import { useAuth } from '../context/AuthContext'

export const recommendationQueryKeys = {
  all: ['recommendations'] as const,
  plan: (userId: string | undefined) => ['recommendations', userId, 'plan'] as const,
  saved: (userId: string | undefined) => ['recommendations', userId, 'saved'] as const,
}

export function useRecommendations() {
  const { user } = useAuth()
  return useQuery({
    queryKey: recommendationQueryKeys.plan(user?.id),
    queryFn: fetchRecommendations,
    enabled: Boolean(user),
    staleTime: 30_000,
  })
}

export function useSavedRecommendations() {
  const { user } = useAuth()
  return useQuery({
    queryKey: recommendationQueryKeys.saved(user?.id),
    queryFn: fetchSavedRecommendations,
    enabled: Boolean(user),
    staleTime: 30_000,
  })
}

export function useRecommendationActions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.plan(user?.id) }),
    queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.saved(user?.id) }),
  ])
  const feedback = useMutation({
    mutationFn: ({ id, helpful, relevant }: { id: string; helpful: boolean; relevant: boolean }) => submitRecommendationFeedback(id, { helpful, relevant }),
    onSuccess: invalidate,
  })
  const saving = useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      if (saved) await saveRecommendation(id)
      else await unsaveRecommendation(id)
    },
    onSuccess: invalidate,
  })
  return { feedback, saving }
}
