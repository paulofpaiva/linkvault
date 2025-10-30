import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useExploreUsers } from '@/hooks/useExplore'
import UserItemList from '@/components/explore/UserItemList'
import UserItemListSkeleton from '@/components/skeletons/UserItemListSkeleton'
import { Search } from 'lucide-react'
import { Error as ErrorState } from '@/components/ui/error'
import { Empty } from '@/components/ui/empty'
import { Users } from 'lucide-react'

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const initialQ = params.get('q') || ''
  const [q, setQ] = useState(initialQ)

  const [debouncedQ, setDebouncedQ] = useState(initialQ)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    const next = new URLSearchParams(params)
    if (debouncedQ) next.set('q', debouncedQ)
    else next.delete('q')
    setParams(next, { replace: true })
  }, [debouncedQ])

  const { items, isLoading, isFetchingNextPage, hasNextPage, setSentinelRef, error, refetch } = useExploreUsers(debouncedQ, 12)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Explore</h2>
        <p className="text-muted-foreground">Find other users</p>
      </div>

      <div className="relative">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users by name"
          className="pr-9"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <UserItemListSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Error fetching users"
          description="Try again in a few seconds or reload the page."
          actionLabel="Try again"
          onAction={() => refetch()}
        />
      ) : items.length === 0 ? (
        <Empty
          icon={Users}
          title={debouncedQ ? 'No users found' : 'Start searching users'}
          description={debouncedQ ? 'Try a different name.' : 'Type a name in the search box to find users.'}
          actionLabel={debouncedQ ? 'Clear search' : undefined}
          onAction={debouncedQ ? () => setQ('') : undefined}
        />
      ) : (
        <>
          <div className="divide-y">
            {items.map((u) => (
              <UserItemList
                key={u.id}
                id={u.id}
                name={u.name}
                publicCollectionsCount={u.publicCollectionsCount}
                publicLinksCount={u.publicLinksCount}
                onClick={(id) => navigate(`/explore/user/${id}${debouncedQ ? `?q=${encodeURIComponent(debouncedQ)}` : ''}`)}
              />
            ))}
          </div>
          <div ref={setSentinelRef} />
          {hasNextPage && isFetchingNextPage && (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <UserItemListSkeleton key={`more-${i}`} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}


