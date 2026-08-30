import { Suspense, lazy, type JSX } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const DataRoomsPage = lazy(() =>
  import('@/pages/DataRoomsPage').then((m) => ({ default: m.DataRoomsPage })),
)
const DataRoomPage = lazy(() =>
  import('@/pages/DataRoomPage').then((m) => ({ default: m.DataRoomPage })),
)
const FolderPage = lazy(() =>
  import('@/pages/FolderPage').then((m) => ({ default: m.FolderPage })),
)
const SharedViewPage = lazy(() =>
  import('@/pages/SharedViewPage').then((m) => ({ default: m.SharedViewPage })),
)

function PageFallback(): JSX.Element {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/shared/:token',
    element: (
      <Suspense fallback={<PageFallback />}>
        <SharedViewPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageFallback />}>
          <DataRoomsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/rooms/:roomId',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageFallback />}>
          <DataRoomPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/rooms/:roomId/folders/:folderId',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageFallback />}>
          <FolderPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />
}
