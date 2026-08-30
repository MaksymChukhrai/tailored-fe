import type { JSX } from 'react'
import { Folder } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatBytes } from '@/lib/format'
import type { FolderNode } from '@/types/api'

interface SharedFolderCardProps {
  folder: FolderNode
  onOpen: (folder: FolderNode) => void
}

export function SharedFolderCard({ folder, onOpen }: SharedFolderCardProps): JSX.Element {
  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
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
      </CardContent>
    </Card>
  )
}
