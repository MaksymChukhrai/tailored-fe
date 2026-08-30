import { useState, type JSX } from 'react'
import { toast } from 'sonner'
import { FolderOpen } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { CreateDataRoomDialog } from '@/components/data-room/CreateDataRoomDialog'
import { DataRoomCard } from '@/components/data-room/DataRoomCard'
import { RenameDialog } from '@/components/data-room/RenameDialog'
import { ShareDialog } from '@/components/data-room/ShareDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDataRooms,
  useRenameDataRoom,
  useDeleteDataRoom,
} from '@/api/data-rooms'
import { ApiError } from '@/api/client'
import type { DataRoomSummary } from '@/types/api'

export function DataRoomsPage(): JSX.Element {
  const { data: dataRooms, isLoading, isError } = useDataRooms()

  const [renameTarget, setRenameTarget] = useState<DataRoomSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DataRoomSummary | null>(null)
  const [shareTarget, setShareTarget] = useState<DataRoomSummary | null>(null)

  const renameDataRoom = useRenameDataRoom(renameTarget?.id ?? '')
  const deleteDataRoom = useDeleteDataRoom()

  const handleRenameConfirm = (newName: string): void => {
    renameDataRoom.mutate(newName, {
      onSuccess: () => {
        toast.success('Data room renamed')
        setRenameTarget(null)
      },
      onError: (error: unknown) => {
        toast.error(error instanceof ApiError ? error.message : 'Rename failed')
      },
    })
  }

  const handleDeleteConfirm = (): void => {
    if (!deleteTarget) return

    deleteDataRoom.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Data room deleted')
        setDeleteTarget(null)
      },
      onError: (error: unknown) => {
        toast.error(error instanceof ApiError ? error.message : 'Delete failed')
      },
    })
  }

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Data Rooms
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure spaces for due diligence documents
            </p>
          </div>
          <CreateDataRoomDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            Failed to load data rooms. Please try again.
          </div>
        ) : null}

        {!isLoading && !isError && dataRooms?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <FolderOpen className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No data rooms yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first data room to get started
              </p>
            </div>
          </div>
        ) : null}

        {dataRooms && dataRooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataRooms.map((dataRoom) => (
              <DataRoomCard
                key={dataRoom.id}
                dataRoom={dataRoom}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
                onShare={setShareTarget}
              />
            ))}
          </div>
        ) : null}
      </main>

      {renameTarget ? (
        <RenameDialog
          open={Boolean(renameTarget)}
          onOpenChange={(open) => !open && setRenameTarget(null)}
          currentName={renameTarget.name}
          isPending={renameDataRoom.isPending}
          onConfirm={handleRenameConfirm}
        />
      ) : null}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the data room and everything inside it
              ({deleteTarget?.itemCount} items). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDataRoom.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteDataRoom.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDataRoom.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog
        target={shareTarget ? { type: 'dataRoom', id: shareTarget.id } : null}
        itemName={shareTarget?.name ?? ''}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />
    </div>
  )
}
