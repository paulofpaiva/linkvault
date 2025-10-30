import { useParams } from 'react-router-dom';
import { usePublicCollection } from '@/hooks/usePublicCollection';
import PublicLinkCard from '@/components/links/PublicLinkCard';
import LinkCardSkeleton from '@/components/skeletons/LinkCardSkeleton';
import { Error as ErrorState } from '@/components/ui/error';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Empty } from '@/components/ui/empty';
import { Folder, Copy } from 'lucide-react';
import PublicCollectionHeaderSkeleton from '@/components/skeletons/PublicCollectionHeaderSkeleton';
import { useClonePublicCollection } from '@/hooks/usePublicCollection';
import { useAuthStore } from '@/stores/authStore';

export default function PublicCollection() {
  const { id } = useParams<{ id: string }>();
  const { meta, owner, items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch } = usePublicCollection(id, 10);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cloneMutation = useClonePublicCollection();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {!isLoading && (
        <div className="rounded-xl border bg-accent/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm">
            <span className="font-medium">Preview:</span> This collection was shared with you. Create an account to save and organize your own links.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/auth/sign-in')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/auth/sign-up')}>Sign Up</Button>
          </div>
        </div>
      )}

        {isLoading || !meta ? (
          <PublicCollectionHeaderSkeleton />
        ) : (
          <header className="space-y-1">
            {!meta?.isPrivate && (
              <>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <span className="block truncate">{meta?.title ?? 'Collection'}</span>
                    <span className="ml-1 text-2xl font-normal text-muted-foreground">
                      ({meta?.linkCount ?? 0})
                    </span>
                  </h2>
                  {isAuthenticated && (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!meta?.id) return;
                        cloneMutation.mutate({ collectionId: meta.id }, {
                          onSuccess: (response) => {
                            const newId = response?.data?.id;
                            if (newId) {
                              navigate(`/collections/${newId}`);
                            }
                          },
                        });
                      }}
                      disabled={cloneMutation.isPending}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  by {owner?.name ?? 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {meta?.createdAt ? `created at ${format(new Date(meta.createdAt), 'PPP')}` : ''}
                </p>
              </>
            )}
          </header>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <LinkCardSkeleton count={6} />
          </div>
        ) : meta?.isPrivate ? (
          <ErrorState
            title="Private collection"
            description="This collection is private and cannot be accessed."
            actionLabel="Go back"
            onAction={() => navigate('/collections')}
          />
        ) : error ? (
          <ErrorState
            title="Error loading collection"
            description="Try again in a few seconds or reload the page."
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        ) : items.length === 0 ? (
          <Empty
            icon={Folder}
            title="No links in this collection"
            description="This public collection doesn't have any links yet."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((link) => (
                <PublicLinkCard key={link.id} link={link} />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <button
                  className="px-4 py-2 text-sm rounded border hover:bg-accent"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
}


