import { useState, type JSX, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Copy, Trash2, Users, Globe, X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { Share } from '@/types/api'
import { useAddGrantee, useRemoveGrantee, type ShareTargetRef } from '@/api/shares'
import { ApiError } from '@/api/client'

interface ShareLinkRowProps {
  share: Share
  target: ShareTargetRef
  onRevoke: (shareId: string) => void
  isRevoking: boolean
}

export function ShareLinkRow({
  share,
  target,
  onRevoke,
  isRevoking,
}: ShareLinkRowProps): JSX.Element {
  const [newGranteeEmail, setNewGranteeEmail] = useState('')
  const addGrantee = useAddGrantee(target)
  const removeGrantee = useRemoveGrantee(target)

  const shareUrl = `${window.location.origin}/shared/${share.token}`

  const handleCopyLink = (): void => {
    void navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Link copied to clipboard')
    })
  }

  const handleAddGrantee = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmedEmail = newGranteeEmail.trim()
    if (!trimmedEmail) return

    addGrantee.mutate(
      { shareId: share.id, email: trimmedEmail },
      {
        onSuccess: () => {
          setNewGranteeEmail('')
        },
        onError: (error: unknown) => {
          toast.error(error instanceof ApiError ? error.message : 'Failed to add person')
        },
      },
    )
  }

  const handleRemoveGrantee = (granteeUserId: string): void => {
    removeGrantee.mutate(
      { shareId: share.id, granteeUserId },
      {
        onError: (error: unknown) => {
          toast.error(error instanceof ApiError ? error.message : 'Failed to remove')
        },
      },
    )
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {share.mode === 'PUBLIC_LINK' ? (
            <Globe className="size-4 text-muted-foreground" />
          ) : (
            <Users className="size-4 text-muted-foreground" />
          )}
          <Badge variant="secondary">
            {share.mode === 'PUBLIC_LINK' ? 'Public link' : 'Restricted'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRevoke(share.id)}
          disabled={isRevoking}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      {share.mode === 'PUBLIC_LINK' ? (
        <div className="mt-2 flex gap-2">
          <Input value={shareUrl} readOnly className="text-xs" />
          <Button variant="outline" size="icon" onClick={handleCopyLink}>
            <Copy className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <div className="space-y-1">
            {share.grantees && share.grantees.length > 0 ? (
              share.grantees.map((grantee) => (
                <div
                  key={grantee.userId}
                  className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-sm"
                >
                  <span className="truncate">{grantee.email}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveGrantee(grantee.userId)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No people added yet</p>
            )}
          </div>
          <form onSubmit={handleAddGrantee} className="flex gap-2">
            <Input
              type="email"
              value={newGranteeEmail}
              onChange={(event) => setNewGranteeEmail(event.target.value)}
              placeholder="colleague@company.com"
              className="text-sm"
            />
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={!newGranteeEmail.trim() || addGrantee.isPending}
            >
              <UserPlus className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
