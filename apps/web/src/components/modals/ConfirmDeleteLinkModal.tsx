import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  linkTitle?: string
  isLoading: boolean
}

export default function ConfirmDeleteLinkModal({
  isOpen,
  onClose,
  onConfirm,
  linkTitle,
  isLoading,
}: ConfirmDeleteLinkModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Link"
      description="This action cannot be undone"
      actionButton={
        <Button
          variant="destructive"
          onClick={onConfirm}
          className="flex-1"
          disabled={isLoading}
        >
          Delete
        </Button>
      }
      onCancel={onClose}
      cancelText="Cancel"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="rounded-full bg-red-100 p-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">
            Are you sure you want to delete this link?
          </p>
          {linkTitle && (
            <p className="text-sm text-muted-foreground break-words">
              “{linkTitle}” will be permanently removed.
            </p>
          )}
        </div>
      </div>
    </ResponsiveModal>
  )
}


