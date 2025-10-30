import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Error as ErrorState } from '@/components/ui/error';
import LinkCard from '@/components/links/LinkCard';
import LinkCardSkeleton from '@/components/skeletons/LinkCardSkeleton';
import { useCollectionDetail, useCollectionLinks, useRemoveLinkFromCollection } from '@/hooks/useCollections';
import { Empty } from '@/components/ui/empty';
import { Folder, Link2Icon, Plus } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import AddLinksToCollectionModal from '@/components/modals/AddLinksToCollectionModal';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const detail = useCollectionDetail(id);
  const { items, isLoading, error, isFetchingNextPage, hasNextPage, setSentinelRef, refetch } = useCollectionLinks(id, 10);
  const removeMutation = useRemoveLinkFromCollection(id as string);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Breadcrumb label="Back to collections" backTo="/collections" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{detail.data?.title ?? 'Collection'}</h2>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <motion.div 
            whileHover={{ y: -2, scale: 1.04 }} 
            whileTap={{ scale: 0.995 }} 
            transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
          >
            <Button onClick={() => setIsAddOpen(true)} className="flex-1 sm:flex-initial">
              <Plus className="h-4 w-4 mr-2" />
              Add link
            </Button>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2, scale: 1.04 }} 
            whileTap={{ scale: 0.995 }} 
            transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}>
            <Button variant="outline" disabled className="flex-1 sm:flex-initial">
              <Link2Icon className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <LinkCardSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState
          title="Error loading links"
          description="Try again in a few seconds or reload the page."
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      ) : items.length === 0 ? (
        <>
          <Empty
            icon={Folder}
            title="No links in this collection"
            description="This collection doesn't have any links yet."
            actionLabel="Add links"
            onAction={() => setIsAddOpen(true)}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                dropdownMode="collection"
                onRemoveFromCollection={() => removeMutation.mutate(link.id)}
              />
            ))}
          </div>
          {hasNextPage && <div ref={setSentinelRef} />}
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <LinkCardSkeleton count={3} />
            </div>
          )}
        </>
      )}

      <AddLinksToCollectionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        collectionId={id as string}
        isCollectionPrivate={Boolean(detail.data?.isPrivate)}
      />
    </div>
  );
}


