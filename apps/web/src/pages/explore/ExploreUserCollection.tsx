import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { useExploreUserCollectionLinks, useExploreUser } from '@/hooks/useExplore'
import Breadcrumb from '@/components/Breadcrumb'
import PublicLinkCard from '@/components/links/PublicLinkCard'
import LinkCardSkeleton from '@/components/skeletons/LinkCardSkeleton'
import { Empty } from '@/components/ui/empty'
import { Link2, Folder, Copy } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useClonePublicCollection } from '@/hooks/usePublicCollection'

export default function ExploreUserCollection() {
  const { userId, collectionId } = useParams()
  const [params] = useSearchParams()
  const backQ = params.get('q') || ''
  const location = useLocation() as { state?: { collectionTitle?: string; collectionColor?: string | null; linkCount?: number } }
  const navigate = useNavigate()
  const cloneMutation = useClonePublicCollection()

  const userQuery = useExploreUser(userId)
  const linksQuery = useExploreUserCollectionLinks(userId, collectionId, 15)

  const backToUser = `/explore/user/${userId}${backQ ? `?q=${encodeURIComponent(backQ)}` : ''}`

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb label="Back to user" backTo={backToUser} />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!location.state?.collectionTitle ? (
              <>
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-8 w-56" />
              </>
            ) : (
              <>
                <div className="mt-0.5">
                  <Folder className="h-8 w-8" style={{ color: location.state.collectionColor || undefined }} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight truncate">
                  {location.state.collectionTitle} ({location.state.linkCount ?? 0})
                </h2>
              </>
            )}
          </div>
          {collectionId && (
            <Button
              size="sm"
              onClick={() => {
                cloneMutation.mutate(collectionId, {
                  onSuccess: (response) => {
                    const newId = response?.data?.id
                    if (newId) {
                      navigate(`/collections/${newId}`)
                    }
                  },
                })
              }}
              disabled={cloneMutation.isPending}
            >
              <Copy className="h-4 w-4 mr-2" />
              Clone
            </Button>
          )}
        </div>
        <div className="text-muted-foreground mt-1">
          {userQuery.isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            userQuery.data && (
              <span>Created by {userQuery.data.name}</span>
            )
          )}
        </div>
      </div>

      {linksQuery.isLoading ? (
        <div className="space-y-3">
          <LinkCardSkeleton count={6} />
        </div>
      ) : linksQuery.items.length === 0 ? (
        <Empty
          icon={Link2}
          title="No public links in this collection"
          description="This collection has no public links yet."
        />
      ) : (
        <div className="space-y-3">
          {linksQuery.items.map((link: any) => (
            <PublicLinkCard key={link.id} link={link} />
          ))}
          <div ref={linksQuery.setSentinelRef} />
          {linksQuery.hasNextPage && linksQuery.isFetchingNextPage && (
            <LinkCardSkeleton count={3} />
          )}
        </div>
      )}
    </div>
  )
}


