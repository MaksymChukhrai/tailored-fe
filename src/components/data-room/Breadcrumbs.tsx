import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import type { Breadcrumb } from '@/types/api'

interface BreadcrumbsProps {
  dataRoomId: string
  dataRoomName: string
  trail: Breadcrumb[]
}

export function Breadcrumbs({
  dataRoomId,
  dataRoomName,
  trail,
}: BreadcrumbsProps): JSX.Element {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Link
        to={`/rooms/${dataRoomId}`}
        className="flex items-center gap-1 hover:text-foreground"
      >
        <Home className="size-3.5" />
        {dataRoomName}
      </Link>
      {trail.map((crumb, index) => {
        const isLast = index === trail.length - 1
        return (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.name}</span>
            ) : (
              <Link
                to={`/rooms/${dataRoomId}/folders/${crumb.id}`}
                className="hover:text-foreground"
              >
                {crumb.name}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
