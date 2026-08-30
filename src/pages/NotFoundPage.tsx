import type { JSX } from 'react'
import { Link } from 'react-router-dom'

export function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-sm text-primary underline underline-offset-4">
        Back to home
      </Link>
    </div>
  )
}
