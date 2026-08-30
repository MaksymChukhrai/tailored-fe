import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { ResolvedShare } from '@/types/api'

async function fetchResolvedShare(token: string): Promise<ResolvedShare> {
  const response = await apiClient.get<ResolvedShare>(`/shares/view/${token}`)
  return response.data
}

export function useResolvedShare(token: string | undefined) {
  return useQuery({
    queryKey: ['shared-view', token],
    queryFn: () => fetchResolvedShare(token ?? ''),
    enabled: Boolean(token),
    retry: false,
  })
}
