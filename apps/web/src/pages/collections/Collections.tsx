import { Empty } from '@/components/ui/empty';
import { Error as ErrorState } from '@/components/ui/error';
import { useCollections } from '@/hooks/useCollections';
import type { CollectionWithCount } from '@/types/collections';
import CollectionCard from '@/components/collections/CollectionCard';
import CollectionCardSkeleton from '@/components/skeletons/CollectionCardSkeleton';
import { Folder } from 'lucide-react';
import { useState } from 'react';
import ManageCollectionModal from '@/components/modals/ManageCollectionModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Collections() {
  const { items, isLoading, error, isFetchingNextPage, hasNextPage, setSentinelRef, refetch } = useCollections(12);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<CollectionWithCount | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Collections</h2>
          <p className="text-muted-foreground">Group your public links into folders.</p>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <motion.div 
            whileHover={{ y: -2, scale: 1.04 }} 
            whileTap={{ scale: 0.995 }} 
            transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
          >
            <Button onClick={() => setIsCreateOpen(true)} className="flex-1 sm:flex-initial">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </motion.div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CollectionCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Error loading collections"
          description="Try again in a few seconds or reload the page."
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      ) : items.length === 0 ? (
        <Empty
          icon={Folder}
          title="No collections yet"
          description="Create collections to organize your public links."
          actionLabel="New Collection"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((c: CollectionWithCount) => (
              <CollectionCard key={c.id} collection={c} onEdit={(col) => { setCollectionToEdit(col); setIsCreateOpen(true); }} />
            ))}
          </div>
          {hasNextPage && <div ref={setSentinelRef} />}
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <CollectionCardSkeleton key={`more-${idx}`} />
              ))}
            </div>
          )}
        </>
      )}

      <ManageCollectionModal 
        isOpen={isCreateOpen} 
        onClose={() => { setIsCreateOpen(false); setCollectionToEdit(null); }} 
        collectionToEdit={collectionToEdit as any} />
    </div>
  );
}