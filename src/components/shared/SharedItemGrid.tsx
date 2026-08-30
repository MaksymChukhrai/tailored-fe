import type { JSX } from 'react'
import { FolderOpen } from 'lucide-react'
import { SharedFolderCard } from '@/components/shared/SharedFolderCard'
import { SharedFileCard } from '@/components/shared/SharedFileCard'
import type { FolderNode, FileNode } from '@/types/api'

interface SharedItemGridProps {
  folders: FolderNode[]
  files: FileNode[]
  onOpenFolder: (folder: FolderNode) => void
  onPreviewFile: (file: FileNode) => void
}

export function SharedItemGrid({
  folders,
  files,
  onOpenFolder,
  onPreviewFile,
}: SharedItemGridProps): JSX.Element {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <FolderOpen className="size-10 text-muted-foreground" />
        <p className="font-medium">This folder is empty</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {folders.map((folder) => (
        <SharedFolderCard key={folder.id} folder={folder} onOpen={onOpenFolder} />
      ))}
      {files.map((file) => (
        <SharedFileCard key={file.id} file={file} onPreview={onPreviewFile} />
      ))}
    </div>
  )
}
