import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Share, ShareMode } from '@/types/api'

export type ShareTargetRef =
  | { type: 'dataRoom'; id: string }
  | { type: 'folder'; id: string }
  | { type: 'file'; id: string }

function targetToQueryParam(target: ShareTargetRef): [string, string] {
  const paramName =
    target.type === 'dataRoom'
      ? 'dataRoomId'
      : target.type === 'folder'
        ? 'folderId'
        : 'fileId'
  return [paramName, target.id]
}

function sharesQueryKey(target: ShareTargetRef) {
  return ['shares', target.type, target.id] as const
}

async function fetchShares(target: ShareTargetRef): Promise<Share[]> {
  const [paramName, value] = targetToQueryParam(target)
  const response = await apiClient.get<Share[]>('/shares', {
    params: { [paramName]: value },
  })
  return response.data
}

export function useShares(target: ShareTargetRef | null) {
  return useQuery({
    queryKey: target ? sharesQueryKey(target) : ['shares', 'none'],
    queryFn: () => fetchShares(target as ShareTargetRef),
    enabled: Boolean(target),
  })
}

export function useCreateShare(target: ShareTargetRef) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mode: ShareMode): Promise<Share> => {
      const [paramName, value] = targetToQueryParam(target)
      const response = await apiClient.post<Share>('/shares', {
        mode,
        [paramName]: value,
      })
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sharesQueryKey(target) })
    },
  })
}

export function useRevokeShare(target: ShareTargetRef) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (shareId: string): Promise<void> => {
      await apiClient.delete(`/shares/${shareId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sharesQueryKey(target) })
    },
  })
}

export function useAddGrantee(target: ShareTargetRef) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shareId,
      email,
    }: {
      shareId: string
      email: string
    }): Promise<void> => {
      await apiClient.post(`/shares/${shareId}/grantees`, { email })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sharesQueryKey(target) })
    },
  })
}

export function useRemoveGrantee(target: ShareTargetRef) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shareId,
      granteeUserId,
    }: {
      shareId: string
      granteeUserId: string
    }): Promise<void> => {
      await apiClient.delete(`/shares/${shareId}/grantees/${granteeUserId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sharesQueryKey(target) })
    },
  })
}
