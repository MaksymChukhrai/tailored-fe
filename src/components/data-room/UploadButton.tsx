import { useRef, type JSX, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadQueueStore } from '@/store/upload-queue'

interface UploadButtonProps {
  dataRoomId: string
  folderId?: string
  onUploaded: () => void
}

export function UploadButton({
  dataRoomId,
  folderId,
  onUploaded,
}: UploadButtonProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  const enqueue = useUploadQueueStore((state) => state.enqueue)

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) {
      enqueue(files, dataRoomId, folderId, onUploaded)
    }
    event.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        <Upload className="size-4" />
        Upload
      </Button>
    </>
  )
}
