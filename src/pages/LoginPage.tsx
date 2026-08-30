import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMe, getGoogleLoginUrl } from '@/api/auth'

export function LoginPage(): JSX.Element {
  const { data, isLoading } = useMe()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (data) {
    const from = (location.state as { from?: Location } | null)?.from
    return <Navigate to={from?.pathname ?? '/'} replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Data Room</CardTitle>
          <CardDescription>
            Secure document storage for due diligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="lg">
            <a href={getGoogleLoginUrl()}>Sign in with Google</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
