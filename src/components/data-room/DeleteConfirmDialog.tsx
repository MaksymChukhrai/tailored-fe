import type { JSX } from 'react'
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
import { formatBytes } from '@/lib/format'
import { useFolderDeletePreview } from '@/api/folders'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  itemType: 'file' | 'folder'
  folderIdForPreview?: string
  isPending: boolean
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  folderIdForPreview,
  isPending,
  onConfirm,
}: DeleteConfirmDialogProps): JSX.Element {
  const preview = useFolderDeletePreview(
    itemType === 'folder' && open ? folderIdForPreview : undefined,
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{itemName}"?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {itemType === 'file' ? (
                <span>This file will be permanently deleted. This action cannot be undone.</span>
              ) : preview.isLoading ? (
                <span>Calculating what will be deleted...</span>
              ) : preview.data ? (
                <span>
                  This will permanently delete {preview.data.folderCount} folder
                  {preview.data.folderCount === 1 ? '' : 's'}, {preview.data.fileCount} file
                  {preview.data.fileCount === 1 ? '' : 's'} ({formatBytes(preview.data.totalSize)}
                  ). This action cannot be undone.
                </span>
              ) : (
                <span>This folder and everything inside it will be permanently deleted.</span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
