import { createElement, type JSX, type DragEvent } from 'react'
import { MoreVertical, Pencil, Trash2, Download, Share2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { FileNode } from '@/types/api'
import { formatBytes } from '@/lib/format'
import { getFileIcon } from '@/lib/file-icons'
import { DRAG_MIME_TYPE, type DraggedItem } from '@/lib/dnd'

interface FileCardProps {
  file: FileNode
  onPreview: (file: FileNode) => void
  onRename: (file: FileNode) => void
  onDelete: (file: FileNode) => void
  onDownload: (file: FileNode) => void
  onShare: (file: FileNode) => void
}

export function FileCard({
  file,
  onPreview,
  onRename,
  onDelete,
  onDownload,
  onShare,
}: FileCardProps): JSX.Element {
  const handleDragStart = (event: DragEvent<HTMLDivElement>): void => {
    const payload: DraggedItem = { kind: 'file', id: file.id, currentParentId: file.folderId }
    event.dataTransfer.setData(DRAG_MIME_TYPE, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className="group cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem onClick={() => onPreview(file)}>
              <Eye className="size-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(file)}>
              <Download className="size-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(file)}>
              <Share2 className="size-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(file)}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(file)}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
