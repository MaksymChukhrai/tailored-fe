import { useState, type JSX } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, FolderLock, ChevronRight, Home } from 'lucide-react'
import { SharedItemGrid } from '@/components/shared/SharedItemGrid'
import { FilePreviewDialog } from '@/components/data-room/FilePreviewDialog'
import { useResolvedShare } from '@/api/shared-view'
import { useFolder } from '@/api/folders'
import type { FolderNode, FileNode, Breadcrumb } from '@/types/api'

export function SharedViewPage(): JSX.Element {
  const { token } = useParams<{ token: string }>()
  const resolved = useResolvedShare(token)
  const [openFolderId, setOpenFolderId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null)

  const folder = useFolder(openFolderId ?? undefined)

  if (resolved.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (resolved.isError || !resolved.data) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 px-4 text-center">
        <FolderLock className="size-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Link unavailable</h1>
        <p className="text-sm text-muted-foreground">
          This share link is invalid, has expired, or you don't have permission to view it.
        </p>
      </div>
    )
  }

  const { content } = resolved.data

  if (content.type === 'file') {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            A file has been shared with you
          </p>
          <a
            href={content.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open file
          </a>
        </div>
      </div>
    );
  }

  const rootFolders =
    content.type === 'dataRoom' ? content.rootContents.subfolders : content.contents.subfolders
  const rootFiles =
    content.type === 'dataRoom' ? content.rootContents.files : content.contents.files
  const rootName =
    content.type === 'dataRoom' ? content.rootContents.dataRoom.name : content.contents.folder.name

  const activeFolders = openFolderId ? folder.data?.subfolders ?? [] : rootFolders
  const activeFiles = openFolderId ? folder.data?.files ?? [] : rootFiles
  const isNestedLoading = Boolean(openFolderId) && folder.isLoading

  const handleOpenFolder = (targetFolder: FolderNode): void => {
    setOpenFolderId(targetFolder.id)
  }

  const trail: Breadcrumb[] = openFolderId && folder.data ? folder.data.breadcrumbs : []

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          <FolderLock className="size-5" />
          <span className="font-semibold">Data Room</span>
          <span className="text-sm text-muted-foreground">&middot; Shared view</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setOpenFolderId(null)}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Home className="size-3.5" />
            {rootName}
          </button>
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1
            return (
              <span key={crumb.id} className="flex items-center gap-1">
                <ChevronRight className="size-3.5" />
                {isLast ? (
                  <span className="font-medium text-foreground">{crumb.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenFolderId(crumb.id)}
                    className="hover:text-foreground"
                  >
                    {crumb.name}
                  </button>
                )}
              </span>
            )
          })}
        </nav>

        {isNestedLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SharedItemGrid
            folders={activeFolders}
            files={activeFiles}
            onOpenFolder={handleOpenFolder}
            onPreviewFile={setPreviewFile}
          />
        )}
      </main>

      <FilePreviewDialog file={previewFile} onOpenChange={(open) => !open && setPreviewFile(null)} />
    </div>
  )
}
