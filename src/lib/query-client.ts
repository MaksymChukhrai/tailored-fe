import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof Object &&
          'statusCode' in error &&
          (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404)
        ) {
          return false
        }
        return failureCount < 2
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
