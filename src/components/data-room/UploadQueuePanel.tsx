import type { JSX } from 'react'
import { CheckCircle2, X, RotateCcw, FileIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUploadQueueStore } from '@/store/upload-queue'
import { formatBytes } from '@/lib/format'

export function UploadQueuePanel(): JSX.Element | null {
  const tasks = useUploadQueueStore((state) => state.tasks)
  const retry = useUploadQueueStore((state) => state.retry)
  const remove = useUploadQueueStore((state) => state.remove)
  const clearCompleted = useUploadQueueStore((state) => state.clearCompleted)

  if (tasks.length === 0) {
    return null
  }

  const activeCount = tasks.filter((task) => task.status === 'uploading' || task.status === 'pending').length
  const allDone = activeCount === 0

  return (
    <div className="fixed bottom-4 right-4 z-20 w-80 rounded-lg border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">
          {allDone ? 'Uploads complete' : `Uploading ${activeCount} file${activeCount === 1 ? '' : 's'}...`}
        </span>
        {allDone ? (
          <Button variant="ghost" size="icon-sm" onClick={clearCompleted}>
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/50">
            <div className="mt-0.5 shrink-0">
              {task.status === 'success' ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : task.status === 'error' ? (
                <AlertCircle className="size-4 text-destructive" />
              ) : (
                <FileIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{task.file.name}</p>
              {task.status === 'uploading' || task.status === 'pending' ? (
                <Progress value={task.progress} className="mt-1 h-1.5" />
              ) : task.status === 'error' ? (
                <p className="text-xs text-destructive">{task.errorMessage ?? 'Upload failed'}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{formatBytes(task.file.size)}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              {task.status === 'error' ? (
                <Button variant="ghost" size="icon-sm" onClick={() => retry(task.id)}>
                  <RotateCcw className="size-3.5" />
                </Button>
              ) : null}
              {task.status !== 'uploading' ? (
                <Button variant="ghost" size="icon-sm" onClick={() => remove(task.id)}>
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
