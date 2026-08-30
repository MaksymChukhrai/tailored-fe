import type { JSX, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useMe } from '@/api/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { data, isLoading, isError } = useMe()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (isError || !data) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
