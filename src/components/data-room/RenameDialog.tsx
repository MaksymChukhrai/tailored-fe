import { useState, useEffect, type JSX, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  isPending: boolean
  onConfirm: (newName: string) => void
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  isPending,
  onConfirm,
}: RenameDialogProps): JSX.Element {
  const [name, setName] = useState(currentName)

  useEffect(() => {
    if (open) {
      setName(currentName)
    }
  }, [open, currentName])

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName === currentName) {
      return
    }
    onConfirm(trimmedName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="rename-input">Name</Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              onFocus={(event) => event.target.select()}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || name.trim() === currentName || isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
