import { useState, type JSX, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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
import { useCreateDataRoom } from '@/api/data-rooms'
import { ApiError } from '@/api/client'

export function CreateDataRoomDialog(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createDataRoom = useCreateDataRoom()
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    createDataRoom.mutate(trimmedName, {
      onSuccess: (dataRoom) => {
        toast.success(`"${dataRoom.name}" created`)
        setOpen(false)
        setName('')
        navigate(`/rooms/${dataRoom.id}`)
      },
      onError: (error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : 'Failed to create data room'
        toast.error(message)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New data room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new data room</DialogTitle>
            <DialogDescription>
              Give your data room a name. You can rename it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="data-room-name">Name</Label>
            <Input
              id="data-room-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Corp. Acquisition"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || createDataRoom.isPending}
            >
              {createDataRoom.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
