import type { JSX } from 'react'
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

interface FolderCardProps {
  folder: FolderNode
  onOpen: (folder: FolderNode) => void
  onRename: (folder: FolderNode) => void
  onDelete: (folder: FolderNode) => void
  onShare: (folder: FolderNode) => void
}

export function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
  onShare,
}: FolderCardProps): JSX.Element {
  return (
    <Card
      className="group cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
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
