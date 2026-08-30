import type { JSX } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShareLinkRow } from '@/components/data-room/ShareLinkRow'
import {
  useShares,
  useCreateShare,
  useRevokeShare,
  type ShareTargetRef,
} from '@/api/shares'
import { ApiError } from '@/api/client'

interface ShareDialogProps {
  target: ShareTargetRef | null
  itemName: string
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({
  target,
  itemName,
  onOpenChange,
}: ShareDialogProps): JSX.Element {
  const shares = useShares(target)
  const createShare = useCreateShare(target ?? { type: 'file', id: '' })
  const revokeShare = useRevokeShare(target ?? { type: 'file', id: '' })

  const handleCreatePublicLink = (): void => {
    createShare.mutate('PUBLIC_LINK', {
      onSuccess: () => {
        toast.success('Public link created')
      },
      onError: (error: unknown) => {
        toast.error(error instanceof ApiError ? error.message : 'Failed to create link')
      },
    })
  }

  const handleCreatePermissioned = (): void => {
    createShare.mutate('PERMISSIONED', {
      onSuccess: () => {
        toast.success('Share created — add people below')
      },
      onError: (error: unknown) => {
        toast.error(error instanceof ApiError ? error.message : 'Failed to create share')
      },
    })
  }

  const handleRevoke = (shareId: string): void => {
    revokeShare.mutate(shareId, {
      onSuccess: () => {
        toast.success('Share revoked')
      },
      onError: (error: unknown) => {
        toast.error(error instanceof ApiError ? error.message : 'Failed to revoke')
      },
    })
  }

  const activeShares = shares.data ?? []
  const hasPublicLink = activeShares.some((share) => share.mode === 'PUBLIC_LINK')
  const hasPermissioned = activeShares.some((share) => share.mode === 'PERMISSIONED')

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="truncate">Share "{itemName}"</DialogTitle>
          <DialogDescription>
            Anyone with a public link can view. Restricted shares are limited to
            specific people by email.
          </DialogDescription>
        </DialogHeader>

        {shares.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {activeShares.map((share) => (
              <ShareLinkRow
                key={share.id}
                share={share}
                target={target as ShareTargetRef}
                onRevoke={handleRevoke}
                isRevoking={revokeShare.isPending}
              />
            ))}

            <Separator />

            <div className="flex gap-2">
              {!hasPublicLink ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCreatePublicLink}
                  disabled={createShare.isPending}
                >
                  Create public link
                </Button>
              ) : null}
              {!hasPermissioned ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCreatePermissioned}
                  disabled={createShare.isPending}
                >
                  Share with people
                </Button>
              ) : null}
            </div>

            {hasPublicLink && hasPermissioned ? (
              <p className="text-center text-xs text-muted-foreground">
                Both share types are active for this item
              </p>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
