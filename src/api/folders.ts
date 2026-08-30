import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { FolderContents, FolderDeletePreview } from '@/types/api'

const FOLDER_KEY = (id: string) => ['folders', id] as const

function invalidateTree(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.removeQueries({ queryKey: ["folders"] });
  queryClient.removeQueries({ queryKey: ["data-rooms"] });
  void queryClient.refetchQueries({ queryKey: ["folders"], type: "active" });
  void queryClient.refetchQueries({ queryKey: ["data-rooms"], type: "active" });
}

async function fetchFolder(id: string): Promise<FolderContents> {
  const response = await apiClient.get<FolderContents>(`/folders/${id}`)
  return response.data
}

export function useFolder(id: string | undefined) {
  return useQuery({
    queryKey: FOLDER_KEY(id ?? ''),
    queryFn: () => fetchFolder(id ?? ''),
    enabled: Boolean(id),
  })
}

interface CreateFolderParams {
  name: string
  dataRoomId: string
  parentId?: string
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateFolderParams): Promise<FolderContents['folder']> => {
      const response = await apiClient.post<FolderContents['folder']>(
        '/folders',
        params,
      )
      return response.data
    },
    onSuccess: () => {
      invalidateTree(queryClient)
    },
  })
}

interface RenameFolderParams {
  id: string
  name: string
  parentId: string | null
  dataRoomId: string
}

export function useRenameFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: RenameFolderParams): Promise<FolderContents['folder']> => {
      const response = await apiClient.patch<FolderContents['folder']>(
        `/folders/${id}`,
        { name },
      )
      return response.data
    },
    onSuccess: () => {
      invalidateTree(queryClient)
    },
  })
}

interface MoveFolderParams {
  id: string
  targetParentId?: string
  sourceParentId: string | null
  dataRoomId: string
}

export function useMoveFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, targetParentId }: MoveFolderParams): Promise<void> => {
      await apiClient.patch(`/folders/${id}/move`, { targetParentId })
    },
    onSuccess: () => {
      invalidateTree(queryClient)
    },
  })
}

async function fetchDeletePreview(id: string): Promise<FolderDeletePreview> {
  const response = await apiClient.get<FolderDeletePreview>(
    `/folders/${id}/delete-preview`,
  )
  return response.data
}

export function useFolderDeletePreview(id: string | undefined) {
  return useQuery({
    queryKey: ['folders', id, 'delete-preview'],
    queryFn: () => fetchDeletePreview(id ?? ''),
    enabled: Boolean(id),
  })
}

interface DeleteFolderParams {
  id: string
  parentId: string | null
  dataRoomId: string
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: DeleteFolderParams): Promise<void> => {
      await apiClient.delete(`/folders/${id}`)
    },
    onSuccess: () => {
      invalidateTree(queryClient)
    },
  })
}
