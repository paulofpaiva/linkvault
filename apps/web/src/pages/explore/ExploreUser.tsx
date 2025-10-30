import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExploreUser, useExploreUserCollections, useExploreUserLinks } from '@/hooks/useExplore'
import PublicCollectionCard from '@/components/collections/PublicCollectionCard'
import CollectionCardSkeleton from '@/components/skeletons/CollectionCardSkeleton'
import PublicLinkCard from '@/components/links/PublicLinkCard'
import LinkCardSkeleton from '@/components/skeletons/LinkCardSkeleton'
import Breadcrumb from '@/components/Breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/text'
import { Empty } from '@/components/ui/empty'
import { Folder, Link2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'

export default function ExploreUser() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const activeTab = (params.get('tab') || 'collections') as 'collections' | 'links'
  const backQ = params.get('q') || ''

  const userQuery = useExploreUser(userId)
  const collectionsQuery = useExploreUserCollections(userId, 9)
  const linksQuery = useExploreUserLinks(userId, 12)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const isSelf = currentUserId && userId && currentUserId === userId

  const onTabChange = (val: string) => {
    const next = new URLSearchParams(params)
    next.set('tab', val)
    setParams(next, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb label="Back to Explore" backTo={`/explore${backQ ? `?q=${encodeURIComponent(backQ)}` : ''}`} />
        <div className="flex items-center gap-3">
          {userQuery.isLoading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-40" />
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {userQuery.data ? getInitials(userQuery.data.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{userQuery.data?.name}</h2>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span>Joined {format(new Date(userQuery.data!.createdAt), 'PPP')}</span>
                  <span>·</span>
                  {isSelf ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-medium">Yourself</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">Public profile</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="overflow-x-auto">
          <TabsList className="w-full md:w-auto justify-start">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="collections" className="space-y-4 mt-6">
          {collectionsQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CollectionCardSkeleton key={idx} />
              ))}
            </div>
          ) : collectionsQuery.items.length === 0 ? (
            <Empty
              icon={Folder}
              title="No public collections"
              description="This user has no public collections yet."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {collectionsQuery.items.map((c: any) => (
                  <PublicCollectionCard
                    key={c.id}
                    collection={c}
                    onClick={(id: string) => {
                      const q = backQ ? `?q=${encodeURIComponent(backQ)}` : ''
                      navigate(`/explore/user/${userId}/collection/${id}${q}`,
                        { state: { collectionTitle: c.title, collectionColor: c.color, linkCount: c.linkCount } }
                      )
                    }}
                  />
                ))}
              </div>
              <div ref={collectionsQuery.setSentinelRef} />
            </>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-6">
          {linksQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <LinkCardSkeleton key={idx} />
              ))}
            </div>
          ) : linksQuery.items.length === 0 ? (
            <Empty
              icon={Link2}
              title="No public links"
              description="This user has no public links yet."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {linksQuery.items.map((link: any) => (
                  <PublicLinkCard key={link.id} link={link} />
                ))}
              </div>
              <div ref={linksQuery.setSentinelRef} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


