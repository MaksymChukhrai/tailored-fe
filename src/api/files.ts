import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { FileNode } from '@/types/api'

function invalidateTree(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({
    queryKey: ["folders"],
    refetchType: "active",
  });
  void queryClient.invalidateQueries({
    queryKey: ["data-rooms"],
    refetchType: "active",
  });
}

interface UploadFileParams {
  file: File
  dataRoomId: string
  folderId?: string
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export async function uploadFile({
  file,
  dataRoomId,
  folderId,
  onProgress,
  signal,
}: UploadFileParams): Promise<FileNode> {
  const formData = new FormData()
  formData.append('file', file)

  const params = new URLSearchParams({ dataRoomId })
  if (folderId) {
    params.set('folderId', folderId)
  }

  const response = await apiClient.post<FileNode>(
    `/files/upload?${params.toString()}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    },
  )
  return response.data
}

async function fetchDownloadUrl(id: string): Promise<string> {
  const response = await apiClient.get<{ url: string }>(`/files/${id}/download`)
  return response.data.url
}

export async function downloadAndOpenFile(id: string): Promise<void> {
  const url = await fetchDownloadUrl(id)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function getFilePreviewUrl(id: string): Promise<string> {
  return fetchDownloadUrl(id)
}

interface RenameFileParams {
  id: string
  name: string
  folderId: string | null
  dataRoomId: string
}

export function useRenameFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: RenameFileParams): Promise<FileNode> => {
      const response = await apiClient.patch<FileNode>(`/files/${id}`, { name })
      return response.data
    },
    onSuccess: () => {
      invalidateTree(queryClient)
    },
  })
}

interface MoveFileParams {
  id: string
  targetFolderId?: string
  sourceFolderId: string | null
  dataRoomId: string
}

export function useMoveFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, targetFolderId }: MoveFileParams): Promise<void> => {
      await apiClient.patch(`/files/${id}/move`, { targetFolderId })
    },
    onSuccess: () => {
      invalidateTree(queryClient)
    },
  })
}

interface DeleteFileParams {
  id: string
  folderId: string | null
  dataRoomId: string
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteFileParams): Promise<void> => {
      await apiClient.delete(`/files/${id}`);
    },
    onSuccess: () => {
      invalidateTree(queryClient);
    },
  });
}
