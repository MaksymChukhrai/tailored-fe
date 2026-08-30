import { useState, type JSX, type FormEvent } from 'react'
import { toast } from 'sonner'
import { FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateFolder } from '@/api/folders'
import { ApiError } from '@/api/client'

interface CreateFolderDialogProps {
  dataRoomId: string
  parentId?: string
}

export function CreateFolderDialog({
  dataRoomId,
  parentId,
}: CreateFolderDialogProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createFolder = useCreateFolder()

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    createFolder.mutate(
      { name: trimmedName, dataRoomId, parentId },
      {
        onSuccess: (folder) => {
          toast.success(`Folder "${folder.name}" created`)
          setOpen(false)
          setName('')
        },
        onError: (error: unknown) => {
          const message =
            error instanceof ApiError ? error.message : 'Failed to create folder'
          toast.error(message)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="size-4" />
          New folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new folder</DialogTitle>
            <DialogDescription>
              Folder names must be unique within this location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Financial Statements"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || createFolder.isPending}
            >
              {createFolder.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
