import { useEffect, useMemo, useState } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePublicLinks, useAllLinks } from '@/hooks/useLinks';
import type { Link } from '@linkvault/shared';
import { Empty } from '@/components/ui/empty';
import { Error as ErrorState } from '@/components/ui/error';
import { Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAddLinksToCollection } from '@/hooks/useCollections';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  isCollectionPrivate: boolean;
}

export default function AddLinksToCollectionModal({ isOpen, onClose, collectionId, isCollectionPrivate }: Props) {
  const [search, setSearch] = useState('');
  const hook = isCollectionPrivate ? useAllLinks : usePublicLinks;
  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch } = hook(10, search, collectionId);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelected({});
      setSearch('');
    }, 220);
  };

  const handleToggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);
  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k), [selected]);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const addLinksMutation = useAddLinksToCollection(collectionId);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Links to Collection"
      description={isCollectionPrivate ? 'Select from all your links to add to this collection' : 'Select from your public links to add to this collection'}
      actionButton={
        <Button
          onClick={() => addLinksMutation.mutate(selectedIds, { onSuccess: () => handleClose() })}
          disabled={!anySelected || addLinksMutation.isPending}
          className="flex-1"
        >
          Save
        </Button>
      }
      onCancel={handleClose}
      cancelText="Cancel"
    >
      <div className="space-y-2">
        <Input
          placeholder="Search links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {isCollectionPrivate
            ? 'Showing all your links (private and public).'
            : 'Showing only public links because this collection is set to public.'}
        </p>
        <div className="rounded-xl p-2 sm:h-96 overflow-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted/40 rounded" />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Error loading links"
              description="Try again in a few seconds or reload."
              actionLabel="Try again"
              onAction={() => refetch()}
            />
          ) : items.length === 0 ? (
            <Empty
              icon={LinkIcon}
              title={isCollectionPrivate ? 'No links found' : 'No public links'}
              description={isCollectionPrivate ? 'Create a link to add it here.' : 'Create a public link to add it here.'}
            />
          ) : (
            <ul className="space-y-2">
              {items.map((link: Link) => (
                <li key={link.id} className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                  <Checkbox checked={!!selected[link.id]} onCheckedChange={() => handleToggle(link.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{link.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                  </div>
                </li>
              ))}
              {hasNextPage && (
                <li className="flex justify-center">
                  <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading...' : 'Load more'}
                  </Button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
}