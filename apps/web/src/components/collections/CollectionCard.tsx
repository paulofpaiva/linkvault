import { Folder, MoreVertical, Edit, Trash2, Lock, Copy } from 'lucide-react';
import type { CollectionWithCount } from '@/types/collections';
import { ResponsiveDropdown } from '@/components/ui/responsive-dropdown';
import { useState } from 'react';
import ConfirmDeleteCollectionModal from '@/components/modals/ConfirmDeleteCollectionModal';
import { useCloneCollection, useDeleteCollection } from '@/hooks/useCollections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface Props {
  collection: CollectionWithCount;
  onClick?: (id: string) => void;
  onEdit?: (collection: CollectionWithCount) => void;
}

export default function CollectionCard({ collection, onClick, onEdit }: Props) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteCollectionMutation = useDeleteCollection();
  const cloneCollectionMutation = useCloneCollection();

  const dropdownItems = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit?.(collection),
      disabled: !onEdit,
    },
    {
      label: 'Clone',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => {
        const start = new CustomEvent('collection:cloning-start')
        window.dispatchEvent(start)
        cloneCollectionMutation.mutate(collection.id, {
          onSettled: () => {
            const end = new CustomEvent('collection:cloning-end')
            window.dispatchEvent(end)
          }
        })
      },
      disabled: cloneCollectionMutation.isPending,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setIsDeleteOpen(true),
      variant: 'destructive' as const,
      disabled: deleteCollectionMutation.isPending,
    },
  ];

  const handleConfirmDelete = () => {
    deleteCollectionMutation.mutate(collection.id, {
      onSettled: () => setIsDeleteOpen(false),
    });
  };
  return (
    <>
      <motion.div
        initial={{ y: 0, scale: 1, boxShadow: '0 0 #0000' }}
        whileHover={{ y: -2, scale: 1.04 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
        onClick={() => onClick?.(collection.id)}
      >
        <Card className="bg-muted/20 rounded-3xl cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="mt-0.5">
                <Folder className="h-6 w-6" style={{ color: collection.color }} />
              </div>
              <CardTitle className="text-lg flex-1 flex items-center gap-2 min-w-0">
                <span className="truncate">{collection.title}</span>
                {collection.isPrivate && (
                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-label="Private" />
                )}
              </CardTitle>
              <ResponsiveDropdown
                trigger={
                  <button
                    type="button"
                    className="p-1 hover:bg-accent rounded flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                }
                items={dropdownItems}
                align="end"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            <div className="text-xs text-muted-foreground">{collection.linkCount} links</div>
          </CardContent>
        </Card>
      </motion.div>
      <ConfirmDeleteCollectionModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        collectionTitle={collection.title}
        isLoading={deleteCollectionMutation.isPending}
      />
    </>
  );
}


