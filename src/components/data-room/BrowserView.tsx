import { useState, type JSX, type ReactNode } from 'react'
import { toast } from 'sonner'
import { UploadDropzone } from '@/components/data-room/UploadDropzone'
import { UploadButton } from '@/components/data-room/UploadButton'
import { UploadQueuePanel } from '@/components/data-room/UploadQueuePanel'
import { CreateFolderDialog } from '@/components/data-room/CreateFolderDialog'
import { ItemGrid } from '@/components/data-room/ItemGrid'
import { RenameDialog } from '@/components/data-room/RenameDialog'
import { DeleteConfirmDialog } from '@/components/data-room/DeleteConfirmDialog'
import { FilePreviewDialog } from '@/components/data-room/FilePreviewDialog'
import { ShareDialog } from '@/components/data-room/ShareDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useRenameFolder, useDeleteFolder, useMoveFolder } from '@/api/folders'
import { useRenameFile, useDeleteFile, useMoveFile, downloadAndOpenFile } from '@/api/files'
import { ApiError } from '@/api/client'
import type { ShareTargetRef } from '@/api/shares'
import type { DraggedItem } from '@/lib/dnd'
import type { FolderNode, FileNode } from '@/types/api'

type RenameTarget = { type: 'folder'; item: FolderNode } | { type: 'file'; item: FileNode }
type DeleteTarget = { type: 'folder'; item: FolderNode } | { type: 'file'; item: FileNode }
type ShareUiTarget = { ref: ShareTargetRef; name: string }

interface BrowserViewProps {
  dataRoomId: string
  folderId?: string
  titleSlot: ReactNode
  folders: FolderNode[]
  files: FileNode[]
  isLoading: boolean
  isError: boolean
  onOpenFolder: (folder: FolderNode) => void
  onUploaded: () => void
}

export function BrowserView({
  dataRoomId,
  folderId,
  titleSlot,
  folders,
  files,
  isLoading,
  isError,
  onOpenFolder,
  onUploaded,
}: BrowserViewProps): JSX.Element {
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null)
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [shareTarget, setShareTarget] = useState<ShareUiTarget | null>(null)

  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()
  const moveFolder = useMoveFolder()
  const renameFile = useRenameFile()
  const deleteFile = useDeleteFile()
  const moveFile = useMoveFile()

  const handleRenameConfirm = (newName: string): void => {
    if (!renameTarget) return

    if (renameTarget.type === 'folder') {
      renameFolder.mutate(
        {
          id: renameTarget.item.id,
          name: newName,
          parentId: renameTarget.item.parentId,
          dataRoomId,
        },
        {
          onSuccess: () => {
            toast.success('Folder renamed')
            setRenameTarget(null)
          },
          onError: (error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : 'Rename failed')
          },
        },
      )
    } else {
      renameFile.mutate(
        {
          id: renameTarget.item.id,
          name: newName,
          folderId: renameTarget.item.folderId,
          dataRoomId,
        },
        {
          onSuccess: () => {
            toast.success('File renamed')
            setRenameTarget(null)
          },
          onError: (error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : 'Rename failed')
          },
        },
      )
    }
  }

  const handleDeleteConfirm = (): void => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'folder') {
      deleteFolder.mutate(
        {
          id: deleteTarget.item.id,
          parentId: deleteTarget.item.parentId,
          dataRoomId,
        },
        {
          onSuccess: () => {
            toast.success('Folder deleted')
            setDeleteTarget(null)
          },
          onError: (error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : 'Delete failed')
          },
        },
      )
    } else {
      deleteFile.mutate(
        {
          id: deleteTarget.item.id,
          folderId: deleteTarget.item.folderId,
          dataRoomId,
        },
        {
          onSuccess: () => {
            toast.success('File deleted')
            setDeleteTarget(null)
          },
          onError: (error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : 'Delete failed')
          },
        },
      )
    }
  }

  const handleDownload = (file: FileNode): void => {
    void downloadAndOpenFile(file.id).catch(() => {
      toast.error('Failed to generate download link')
    })
  }

  const handleDropItem = (item: DraggedItem, targetFolderId: string): void => {
    if (item.currentParentId === targetFolderId) {
      return
    }

    if (item.kind === 'folder') {
      moveFolder.mutate(
        {
          id: item.id,
          targetParentId: targetFolderId,
          sourceParentId: item.currentParentId,
          dataRoomId,
        },
        {
          onSuccess: () => toast.success('Folder moved'),
          onError: (error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : 'Move failed')
          },
        },
      )
    } else {
      moveFile.mutate(
        {
          id: item.id,
          targetFolderId,
          sourceFolderId: item.currentParentId,
          dataRoomId,
        },
        {
          onSuccess: () => toast.success('File moved'),
          onError: (error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : 'Move failed')
          },
        },
      )
    }
  }

  const isRenamePending = renameFolder.isPending || renameFile.isPending
  const isDeletePending = deleteFolder.isPending || deleteFile.isPending

  return (
    <>
      <UploadDropzone dataRoomId={dataRoomId} folderId={folderId} onUploaded={onUploaded}>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {titleSlot}
            <div className="flex gap-2">
              <CreateFolderDialog dataRoomId={dataRoomId} parentId={folderId} />
              <UploadButton dataRoomId={dataRoomId} folderId={folderId} onUploaded={onUploaded} />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Failed to load contents. Please try again.
            </div>
          ) : (
            <ItemGrid
              folders={folders}
              files={files}
              onOpenFolder={onOpenFolder}
              onRenameFolder={(folder) => setRenameTarget({ type: 'folder', item: folder })}
              onDeleteFolder={(folder) => setDeleteTarget({ type: 'folder', item: folder })}
              onShareFolder={(folder) =>
                setShareTarget({ ref: { type: 'folder', id: folder.id }, name: folder.name })
              }
              onPreviewFile={setPreviewFile}
              onRenameFile={(file) => setRenameTarget({ type: 'file', item: file })}
              onDeleteFile={(file) => setDeleteTarget({ type: 'file', item: file })}
              onDownloadFile={handleDownload}
              onShareFile={(file) =>
                setShareTarget({ ref: { type: 'file', id: file.id }, name: file.name })
              }
              onDropItem={handleDropItem}
            />
          )}
        </main>
      </UploadDropzone>

      <UploadQueuePanel />

      <FilePreviewDialog file={previewFile} onOpenChange={(open) => !open && setPreviewFile(null)} />

      <ShareDialog
        target={shareTarget?.ref ?? null}
        itemName={shareTarget?.name ?? ''}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />

      {renameTarget ? (
        <RenameDialog
          open={Boolean(renameTarget)}
          onOpenChange={(open) => !open && setRenameTarget(null)}
          currentName={renameTarget.item.name}
          isPending={isRenamePending}
          onConfirm={handleRenameConfirm}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          itemName={deleteTarget.item.name}
          itemType={deleteTarget.type}
          folderIdForPreview={deleteTarget.type === 'folder' ? deleteTarget.item.id : undefined}
          isPending={isDeletePending}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  )
}
