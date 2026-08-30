import { useRef, useState, type JSX, type ReactNode, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { useUploadQueueStore } from '@/store/upload-queue'

interface UploadDropzoneProps {
  dataRoomId: string
  folderId?: string
  onUploaded: () => void
  children: ReactNode
}

export function UploadDropzone({
  dataRoomId,
  folderId,
  onUploaded,
  children,
}: UploadDropzoneProps): JSX.Element {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragCounter = useRef(0)
  const enqueue = useUploadQueueStore((state) => state.enqueue)

  const handleDragEnter = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    dragCounter.current += 1
    if (event.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDraggingOver(false)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    dragCounter.current = 0
    setIsDraggingOver(false)

    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      enqueue(files, dataRoomId, folderId, onUploaded)
    }
  }

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDraggingOver ? (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-primary/5 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary bg-background p-10 shadow-xl">
            <UploadCloud className="size-10 text-primary" />
            <p className="text-lg font-medium">Drop files to upload</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
