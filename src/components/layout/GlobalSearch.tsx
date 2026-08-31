import { useEffect, useRef, useState, createElement, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSearchFiles } from '@/api/search'
import { getFileIcon } from '@/lib/file-icons'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FileSearchResult } from '@/types/api'

const DEBOUNCE_MS = 300

function buildResultHref(file: FileSearchResult): string {
  const base = file.folderId
    ? `/rooms/${file.dataRoomId}/folders/${file.folderId}`
    : `/rooms/${file.dataRoomId}`
  return `${base}?highlight=${file.id}`
}

export function GlobalSearch(): JSX.Element {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [rawQuery, setRawQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(rawQuery.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [rawQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: results, isLoading, isFetching } = useSearchFiles(debouncedQuery)

  const handleSelect = (file: FileSearchResult): void => {
    setIsOpen(false)
    setRawQuery('')
    navigate(buildResultHref(file))
  }

  const showDropdown = isOpen && debouncedQuery.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={rawQuery}
          onChange={(event) => {
            setRawQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search files across all rooms..."
          className="h-9 pl-8"
        />
        {isFetching ? (
          <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {showDropdown ? (
        <div className="absolute top-full z-20 mt-1 w-full rounded-lg border bg-popover shadow-md">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Searching...</div>
          ) : !results || results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              No files match &quot;{debouncedQuery}&quot;
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(file)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
                      'hover:bg-muted/60',
                    )}
                  >
                    {createElement(getFileIcon(file.mimeType), {
                      className: 'size-4 shrink-0 text-muted-foreground',
                    })}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {file.dataRoomName}
                        {file.folderName ? ` / ${file.folderName}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
