import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { FileSearchResult } from '@/types/api'

async function searchFiles(query: string): Promise<FileSearchResult[]> {
  const response = await apiClient.get<FileSearchResult[]>('/files/search', {
    params: { q: query },
  })
  return response.data
}

export function useSearchFiles(query: string) {
  return useQuery({
    queryKey: ['files', 'search', query],
    queryFn: () => searchFiles(query),
    enabled: query.trim().length > 0,
  })
}
