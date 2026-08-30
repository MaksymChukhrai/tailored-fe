import { useEffect, useState, type JSX } from 'react'
import { Download, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getFilePreviewUrl } from '@/api/files'
import { getFileIcon } from '@/lib/file-icons'
import { formatBytes } from '@/lib/format'
import type { FileNode } from '@/types/api'

interface FilePreviewDialogProps {
  file: FileNode | null
  onOpenChange: (open: boolean) => void
}

export function FilePreviewDialog({
  file,
  onOpenChange,
}: FilePreviewDialogProps): JSX.Element {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    setIsLoading(true)
    setLoadError(false)

    getFilePreviewUrl(file.id)
      .then((url) => setPreviewUrl(url))
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false))
  }, [file])

  if (!file) {
    return <Dialog open={false} onOpenChange={onOpenChange} />
  }

  const Icon = getFileIcon(file.mimeType)

  return (
    <Dialog open={Boolean(file)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="truncate">{file.name}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-72 items-center justify-center overflow-auto">
          {isLoading ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          ) : loadError || !previewUrl ? (
            <PreviewFallback file={file} Icon={Icon} previewUrl={previewUrl} />
          ) : (
            <FilePreviewContent
              mimeType={file.mimeType}
              url={previewUrl}
              fallback={<PreviewFallback file={file} Icon={Icon} previewUrl={previewUrl} />}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface FilePreviewContentProps {
  mimeType: string
  url: string
  fallback: JSX.Element
}

function FilePreviewContent({
  mimeType,
  url,
  fallback,
}: FilePreviewContentProps): JSX.Element {
  if (mimeType === 'application/pdf') {
    return <iframe src={url} title="File preview" className="h-[70vh] w-full rounded-md border" />
  }

  if (mimeType.startsWith('image/')) {
    return (
      <img
        src={url}
        alt="File preview"
        className="max-h-[70vh] max-w-full rounded-md object-contain"
      />
    )
  }

  if (mimeType.startsWith('video/')) {
    return (
      <video src={url} controls className="max-h-[70vh] w-full rounded-md">
        <track kind="captions" />
      </video>
    )
  }

  if (mimeType.startsWith('audio/')) {
    return <audio src={url} controls className="w-full" />
  }

  return fallback
}

interface PreviewFallbackProps {
  file: FileNode
  Icon: typeof Download
  previewUrl: string | null
}

function PreviewFallback({ file, Icon, previewUrl }: PreviewFallbackProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Icon className="size-16 text-muted-foreground" />
      <div>
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
      </div>
      <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
      {previewUrl ? (
        <Button asChild>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Download className="size-4" />
            Download
          </a>
        </Button>
      ) : null}
    </div>
  )
}
