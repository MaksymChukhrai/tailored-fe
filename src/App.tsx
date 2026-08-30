import type { JSX } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { AppRouter } from '@/routes/AppRouter'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
