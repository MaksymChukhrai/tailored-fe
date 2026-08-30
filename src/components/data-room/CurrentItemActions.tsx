import type { JSX } from 'react'
import { MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CurrentItemActionsProps {
  onRename: () => void
  onDelete: () => void
  onShare: () => void
}

export function CurrentItemActions({
  onRename,
  onDelete,
  onShare,
}: CurrentItemActionsProps): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="size-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="size-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
