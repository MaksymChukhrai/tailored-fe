import { useState, type JSX, type DragEvent } from 'react'
import { Folder, MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { FolderNode } from '@/types/api'
import { formatBytes } from '@/lib/format'
import { DRAG_MIME_TYPE, type DraggedItem } from '@/lib/dnd'

interface FolderCardProps {
  folder: FolderNode
  onOpen: (folder: FolderNode) => void
  onRename: (folder: FolderNode) => void
  onDelete: (folder: FolderNode) => void
  onShare: (folder: FolderNode) => void
  onDropItem: (item: DraggedItem, targetFolderId: string) => void
}

export function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
  onShare,
  onDropItem,
}: FolderCardProps): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (event: DragEvent<HTMLDivElement>): void => {
    const payload: DraggedItem = { kind: 'folder', id: folder.id, currentParentId: folder.parentId }
    event.dataTransfer.setData(DRAG_MIME_TYPE, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    if (event.dataTransfer.types.includes(DRAG_MIME_TYPE)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>): void => {
    if (event.dataTransfer.types.includes(DRAG_MIME_TYPE)) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (): void => {
    setIsDragOver(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    const raw = event.dataTransfer.getData(DRAG_MIME_TYPE)
    if (!raw) {
      setIsDragOver(false)
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)

    try {
      const item = JSON.parse(raw) as DraggedItem
      if (item.kind === 'folder' && item.id === folder.id) {
        return
      }
      onDropItem(item, folder.id)
    } catch {
      // Ignore malformed drag payloads
    }
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40 ${
        isDragOver ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : ''
      }`}
      onClick={() => onOpen(folder)}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <Folder className="size-8 shrink-0 text-blue-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{folder.name}</p>
          <p className="text-xs text-muted-foreground">
            {folder.itemCount} items &middot; {formatBytes(folder.totalSize)}
          </p>
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
            <DropdownMenuItem onClick={() => onShare(folder)}>
              <Share2 className="size-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(folder)}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(folder)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
