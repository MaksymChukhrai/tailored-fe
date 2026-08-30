import { useEffect, type JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/api/auth'

export function AuthCallbackPage(): JSX.Element {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useMe()

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  }, [queryClient])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="text-sm text-muted-foreground">Signing you in...</span>
      </div>
    )
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to="/" replace />
}
