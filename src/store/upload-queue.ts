import { create } from 'zustand'
import { uploadFile } from '@/api/files'
import { formatBytes } from '@/lib/format'

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface UploadTask {
  id: string
  file: File
  dataRoomId: string
  folderId?: string
  status: UploadStatus
  progress: number
  errorMessage?: string
  controller?: AbortController
}

interface UploadQueueState {
  tasks: UploadTask[]
  onUploaded?: () => void
  enqueue: (files: File[], dataRoomId: string, folderId: string | undefined, onUploaded: () => void) => void
  retry: (taskId: string) => void
  remove: (taskId: string) => void
  clearCompleted: () => void
}

const MAX_CONCURRENT_UPLOADS = 3
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

function createTaskId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useUploadQueueStore = create<UploadQueueState>((set, get) => ({
  tasks: [],
  onUploaded: undefined,

  enqueue: (files, dataRoomId, folderId, onUploaded) => {
    const newTasks: UploadTask[] = files.map((file) => {
      const isTooLarge = file.size > MAX_FILE_SIZE_BYTES
      return {
        id: createTaskId(),
        file,
        dataRoomId,
        folderId,
        status: isTooLarge ? 'error' : 'pending',
        progress: 0,
        errorMessage: isTooLarge
          ? `File exceeds the 50 MB limit (${formatBytes(file.size)})`
          : undefined,
      }
    })

    set((state) => ({
      tasks: [...state.tasks, ...newTasks],
      onUploaded,
    }))

    processQueue()
  },

  retry: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: 'pending', progress: 0, errorMessage: undefined }
          : task,
      ),
    }))
    processQueue()
  },

  remove: (taskId) => {
    const task = get().tasks.find((entry) => entry.id === taskId)
    task?.controller?.abort()
    set((state) => ({ tasks: state.tasks.filter((entry) => entry.id !== taskId) }))
  },

  clearCompleted: () => {
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => task.status !== 'success' && task.status !== 'error',
      ),
    }))
  },
}))

function processQueue(): void {
  const state = useUploadQueueStore.getState()
  const uploadingCount = state.tasks.filter((task) => task.status === 'uploading').length
  const availableSlots = MAX_CONCURRENT_UPLOADS - uploadingCount

  if (availableSlots <= 0) {
    return
  }

  const pendingTasks = state.tasks.filter((task) => task.status === 'pending')
  const tasksToStart = pendingTasks.slice(0, availableSlots)

  for (const task of tasksToStart) {
    void runUploadTask(task.id)
  }
}

async function runUploadTask(taskId: string): Promise<void> {
  const task = useUploadQueueStore.getState().tasks.find((entry) => entry.id === taskId)
  if (!task) {
    return
  }

  const controller = new AbortController()

  useUploadQueueStore.setState((state) => ({
    tasks: state.tasks.map((entry) =>
      entry.id === taskId ? { ...entry, status: 'uploading', controller } : entry,
    ),
  }))

  try {
    await uploadFile({
      file: task.file,
      dataRoomId: task.dataRoomId,
      folderId: task.folderId,
      signal: controller.signal,
      onProgress: (percent) => {
        useUploadQueueStore.setState((state) => ({
          tasks: state.tasks.map((entry) =>
            entry.id === taskId ? { ...entry, progress: percent } : entry,
          ),
        }))
      },
    })

    useUploadQueueStore.setState((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId ? { ...entry, status: 'success', progress: 100 } : entry,
      ),
    }))

    useUploadQueueStore.getState().onUploaded?.()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    useUploadQueueStore.setState((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId ? { ...entry, status: 'error', errorMessage: message } : entry,
      ),
    }))
  } finally {
    processQueue()
  }
}
