import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { Folder, MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes, formatDate } from '@/lib/format'
import type { DataRoomSummary } from '@/types/api'

interface DataRoomCardProps {
  dataRoom: DataRoomSummary
  onRename: (dataRoom: DataRoomSummary) => void
  onDelete: (dataRoom: DataRoomSummary) => void
  onShare: (dataRoom: DataRoomSummary) => void
}

export function DataRoomCard({
  dataRoom,
  onRename,
  onDelete,
  onShare,
}: DataRoomCardProps): JSX.Element {
  return (
    <Card className="group relative h-full transition-colors hover:border-primary/50 hover:bg-muted/40">
      <Link to={`/rooms/${dataRoom.id}`}>
        <CardHeader>
          <div className="flex items-center gap-2 pr-6">
            <Folder className="size-5 shrink-0 text-muted-foreground" />
            <CardTitle className="min-w-0 flex-1 truncate text-base">
              {dataRoom.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{dataRoom.itemCount} items</span>
            <span>{formatBytes(dataRoom.totalSize)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Updated {formatDate(dataRoom.updatedAt)}
          </p>
        </CardContent>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onShare(dataRoom)}>
            <Share2 className="size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRename(dataRoom)}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(dataRoom)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}
