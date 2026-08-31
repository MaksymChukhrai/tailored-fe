import type { JSX } from 'react'
import { FolderOpen } from 'lucide-react'
import { FolderCard } from '@/components/data-room/FolderCard'
import { FileCard } from '@/components/data-room/FileCard'
import type { FolderNode, FileNode } from '@/types/api'
import type { DraggedItem } from '@/lib/dnd'

interface ItemGridProps {
  folders: FolderNode[]
  files: FileNode[]
  onOpenFolder: (folder: FolderNode) => void
  onRenameFolder: (folder: FolderNode) => void
  onDeleteFolder: (folder: FolderNode) => void
  onShareFolder: (folder: FolderNode) => void
  onPreviewFile: (file: FileNode) => void
  onRenameFile: (file: FileNode) => void
  onDeleteFile: (file: FileNode) => void
  onDownloadFile: (file: FileNode) => void
  onShareFile: (file: FileNode) => void
  onDropItem: (item: DraggedItem, targetFolderId: string) => void
  highlightFileId?: string
}

export function ItemGrid({
  folders,
  files,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onShareFolder,
  onPreviewFile,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onShareFile,
  onDropItem,
  highlightFileId,
}: ItemGridProps): JSX.Element {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <FolderOpen className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">This folder is empty</p>
          <p className="text-sm text-muted-foreground">
            Upload files or create a subfolder to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onOpen={onOpenFolder}
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
          onShare={onShareFolder}
          onDropItem={onDropItem}
        />
      ))}
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onPreview={onPreviewFile}
          onRename={onRenameFile}
          onDelete={onDeleteFile}
          onDownload={onDownloadFile}
          onShare={onShareFile}
          isHighlighted={file.id === highlightFileId}
        />
      ))}
    </div>
  )
}
