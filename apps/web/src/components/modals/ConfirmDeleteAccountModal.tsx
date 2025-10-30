import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export default function ConfirmDeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: ConfirmDeleteAccountModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
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
            Are you sure you want to delete your account?
          </p>
          <p className="text-sm text-muted-foreground break-words">
            All your data (links, collections, categories) will be permanently removed.
          </p>
        </div>
      </div>
    </ResponsiveModal>
  )
}


