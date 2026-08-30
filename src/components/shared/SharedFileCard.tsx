import { createElement, type JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatBytes } from '@/lib/format'
import { getFileIcon } from '@/lib/file-icons'
import type { FileNode } from '@/types/api'

interface SharedFileCardProps {
  file: FileNode
  onPreview: (file: FileNode) => void
}

export function SharedFileCard({ file, onPreview }: SharedFileCardProps): JSX.Element {
  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
      onClick={() => onPreview(file)}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {createElement(getFileIcon(file.mimeType), {
          className: 'size-8 shrink-0 text-muted-foreground',
        })}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
