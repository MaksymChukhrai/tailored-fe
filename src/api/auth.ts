import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, ApiError } from '@/api/client'
import type { JwtPayload } from '@/types/api'

const ME_QUERY_KEY = ['auth', 'me'] as const

async function fetchMe(): Promise<JwtPayload> {
  const response = await apiClient.get<JwtPayload>('/auth/me')
  return response.data
}

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60_000,
  })
}

export function getGoogleLoginUrl(): string {
  const baseURL = import.meta.env.VITE_API_URL as string
  return `${baseURL}/auth/google`
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post('/auth/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null)
      queryClient.clear()
    },
  })
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 401
}
