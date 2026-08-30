import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { DataRoomSummary, DataRoomRootContents } from '@/types/api'

const DATA_ROOMS_KEY = ['data-rooms'] as const
const DATA_ROOM_KEY = (id: string) => ['data-rooms', id] as const
const DATA_ROOM_CONTENTS_KEY = (id: string) => ['data-rooms', id, 'contents'] as const

async function fetchDataRooms(): Promise<DataRoomSummary[]> {
  const response = await apiClient.get<DataRoomSummary[]>('/data-rooms')
  return response.data
}

export function useDataRooms() {
  return useQuery({
    queryKey: DATA_ROOMS_KEY,
    queryFn: fetchDataRooms,
  })
}

async function fetchDataRoom(id: string): Promise<DataRoomSummary> {
  const response = await apiClient.get<DataRoomSummary>(`/data-rooms/${id}`)
  return response.data
}

export function useDataRoom(id: string | undefined) {
  return useQuery({
    queryKey: DATA_ROOM_KEY(id ?? ''),
    queryFn: () => fetchDataRoom(id ?? ''),
    enabled: Boolean(id),
  })
}

async function fetchDataRoomContents(id: string): Promise<DataRoomRootContents> {
  const response = await apiClient.get<DataRoomRootContents>(
    `/data-rooms/${id}/contents`,
  )
  return response.data
}

export function useDataRoomContents(id: string | undefined) {
  return useQuery({
    queryKey: DATA_ROOM_CONTENTS_KEY(id ?? ''),
    queryFn: () => fetchDataRoomContents(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateDataRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string): Promise<DataRoomSummary> => {
      const response = await apiClient.post<DataRoomSummary>('/data-rooms', {
        name,
      })
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_ROOMS_KEY })
    },
  })
}

export function useRenameDataRoom(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string): Promise<DataRoomSummary> => {
      const response = await apiClient.patch<DataRoomSummary>(
        `/data-rooms/${id}`,
        { name },
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_ROOMS_KEY })
      void queryClient.invalidateQueries({ queryKey: DATA_ROOM_KEY(id) })
    },
  })
}

export function useDeleteDataRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/data-rooms/${id}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DATA_ROOMS_KEY })
    },
  })
}
