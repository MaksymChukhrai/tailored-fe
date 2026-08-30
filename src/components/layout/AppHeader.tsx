import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, FolderLock } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMe, useLogout } from '@/api/auth'

export function AppHeader(): JSX.Element {
  const { data: user } = useMe()
  const logout = useLogout()

  const initial = user?.email.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <FolderLock className="size-5" />
          <span>Data Room</span>
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  )
}
