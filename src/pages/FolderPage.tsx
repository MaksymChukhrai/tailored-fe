import { useState, type JSX } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/AppHeader'
import { BrowserView } from '@/components/data-room/BrowserView'
import { Breadcrumbs } from '@/components/data-room/Breadcrumbs'
import { CurrentItemActions } from '@/components/data-room/CurrentItemActions'
import { RenameDialog } from '@/components/data-room/RenameDialog'
import { DeleteConfirmDialog } from '@/components/data-room/DeleteConfirmDialog'
import { ShareDialog } from '@/components/data-room/ShareDialog'
import { useFolder, useRenameFolder, useDeleteFolder } from '@/api/folders'
import { useDataRoom } from '@/api/data-rooms'
import { ApiError } from '@/api/client'

export function FolderPage(): JSX.Element {
  const { roomId, folderId } = useParams<{ roomId: string; folderId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: dataRoom } = useDataRoom(roomId)
  const folder = useFolder(folderId)

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()

  if (!roomId || !folderId || folder.isError) {
    return <Navigate to={roomId ? `/rooms/${roomId}` : '/'} replace />
  }

  const handleUploaded = (): void => {
    queryClient.removeQueries({ queryKey: ["folders"] });
    queryClient.removeQueries({ queryKey: ["data-rooms"] });
    void queryClient.refetchQueries({ queryKey: ["folders"], type: "active" });
    void queryClient.refetchQueries({
      queryKey: ["data-rooms"],
      type: "active",
    });
  };

  const handleRenameConfirm = (newName: string): void => {
    if (!folder.data) return

    renameFolder.mutate(
      {
        id: folderId,
        name: newName,
        parentId: folder.data.folder.parentId,
        dataRoomId: roomId,
      },
      {
        onSuccess: () => {
          toast.success('Folder renamed')
          setIsRenameOpen(false)
        },
        onError: (error: unknown) => {
          toast.error(error instanceof ApiError ? error.message : 'Rename failed')
        },
      },
    )
  }

  const handleDeleteConfirm = (): void => {
    if (!folder.data) return

    const parentId = folder.data.folder.parentId

    deleteFolder.mutate(
      { id: folderId, parentId, dataRoomId: roomId },
      {
        onSuccess: () => {
          toast.success('Folder deleted')
          navigate(parentId ? `/rooms/${roomId}/folders/${parentId}` : `/rooms/${roomId}`)
        },
        onError: (error: unknown) => {
          toast.error(error instanceof ApiError ? error.message : 'Delete failed')
          setIsDeleteOpen(false)
        },
      },
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <BrowserView
        dataRoomId={roomId}
        folderId={folderId}
        titleSlot={
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {folder.data?.folder.name ?? '...'}
              </h1>
              {folder.data ? (
                <CurrentItemActions
                  onRename={() => setIsRenameOpen(true)}
                  onDelete={() => setIsDeleteOpen(true)}
                  onShare={() => setIsShareOpen(true)}
                />
              ) : null}
            </div>
            {dataRoom && folder.data ? (
              <Breadcrumbs
                dataRoomId={roomId}
                dataRoomName={dataRoom.name}
                trail={folder.data.breadcrumbs}
              />
            ) : null}
          </div>
        }
        folders={folder.data?.subfolders ?? []}
        files={folder.data?.files ?? []}
        isLoading={folder.isLoading}
        isError={folder.isError}
        onOpenFolder={(subfolder) => navigate(`/rooms/${roomId}/folders/${subfolder.id}`)}
        onUploaded={handleUploaded}
      />

      {folder.data ? (
        <RenameDialog
          open={isRenameOpen}
          onOpenChange={setIsRenameOpen}
          currentName={folder.data.folder.name}
          isPending={renameFolder.isPending}
          onConfirm={handleRenameConfirm}
        />
      ) : null}

      {folder.data ? (
        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          itemName={folder.data.folder.name}
          itemType="folder"
          folderIdForPreview={folderId}
          isPending={deleteFolder.isPending}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}

      <ShareDialog
        target={isShareOpen && folder.data ? { type: 'folder', id: folderId } : null}
        itemName={folder.data?.folder.name ?? ''}
        onOpenChange={setIsShareOpen}
      />
    </div>
  )
}
