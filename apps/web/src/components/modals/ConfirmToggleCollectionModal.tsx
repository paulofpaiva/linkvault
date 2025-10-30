import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import CollectionInfo from '@/components/collections/CollectionInfo'

interface ConfirmToggleCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  nextState: 'public' | 'private'
  collectionTitle: string
  linkCount: number
  color?: string
}

export default function ConfirmToggleCollectionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  nextState,
  collectionTitle,
  linkCount,
  color,
}: ConfirmToggleCollectionModalProps) {
  const title = nextState === 'public' ? 'Make collection public' : 'Make collection private'
  const description = nextState === 'public'
    ? 'This collection will be visible publicly. Only non-private links will be shown.'
    : 'This collection will become private and only you will be able to access it.'

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Change collection privacy"
      actionButton={
        <Button
          variant={nextState === 'public' ? 'default' : 'destructive'}
          onClick={onConfirm}
          className="flex-1"
          disabled={isLoading}
        >
          Confirm
        </Button>
      }
      onCancel={onClose}
      cancelText="Cancel"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="rounded-full bg-amber-100 p-4">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">
            {nextState === 'public'
              ? 'Are you sure you want to make this collection public?'
              : 'Are you sure you want to make this collection private?'}
          </p>
          <p className="text-sm text-muted-foreground break-words">
            {description}
          </p>
        </div>
        <CollectionInfo title={collectionTitle} linkCount={linkCount} color={color} className="mt-2" />
      </div>
    </ResponsiveModal>
  )
}


