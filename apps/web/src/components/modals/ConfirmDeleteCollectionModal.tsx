import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import CollectionInfo from '@/components/collections/CollectionInfo'

interface ConfirmDeleteCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  collectionTitle?: string
  isLoading: boolean
  linkCount?: number
  color?: string
}

export default function ConfirmDeleteCollectionModal({
  isOpen,
  onClose,
  onConfirm,
  collectionTitle,
  isLoading,
  linkCount,
  color,
}: ConfirmDeleteCollectionModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Collection"
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
            Are you sure you want to delete this collection?
          </p>
          {collectionTitle && (
            <p className="text-sm text-muted-foreground break-words">
              “{collectionTitle}” will be permanently removed.
            </p>
          )}
        </div>
        {collectionTitle && (
          <CollectionInfo title={collectionTitle} linkCount={linkCount ?? 0} color={color} className="mt-2" />
        )}
      </div>
    </ResponsiveModal>
  )
}


