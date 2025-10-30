import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@linkvault/shared'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

interface ExploreUsersResponse {
  users: Array<{ id: string; name: string; publicCollectionsCount: number; publicLinksCount: number }>
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const useExploreUsers = (q: string, limit: number = 12) => {
  const query = useInfiniteQuery<ExploreUsersResponse>({
    queryKey: ['explore-users', q, limit] as const,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<ExploreUsersResponse>>('/explore/users', {
        params: { q: q || undefined, page: pageParam, limit },
      })
      return response.data.data as ExploreUsersResponse
    },
    getNextPageParam: (lastPage: ExploreUsersResponse) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: Boolean(q),
  })

  const items = (query.data?.pages ?? []).flatMap((p) => p.users)

  const setSentinelRef = useInfiniteScroll(
    () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage()
      }
    },
    Boolean(query.hasNextPage),
    query.isFetchingNextPage
  )

  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
    setSentinelRef,
  }
}

interface ExploreUserBasic {
  id: string
  name: string
  createdAt: string
}

export const useExploreUser = (userId: string | undefined) => {
  return useQuery<ExploreUserBasic, unknown, ExploreUserBasic, [string, string | undefined]>({
    queryKey: ['explore-user', userId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ExploreUserBasic>>(`/explore/users/${userId}`)
      return response.data.data as ExploreUserBasic
    },
    enabled: Boolean(userId),
  })
}

interface PublicCollectionsResponse {
  collections: Array<{ id: string; title: string; color?: string | null; linkCount: number }>
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const useExploreUserCollections = (userId: string | undefined, limit: number = 12) => {
  const query = useInfiniteQuery<PublicCollectionsResponse>({
    queryKey: ['explore-user-collections', userId, limit] as const,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<PublicCollectionsResponse>>(`/explore/users/${userId}/collections`, {
        params: { page: pageParam, limit },
      })
      return response.data.data as PublicCollectionsResponse
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: Boolean(userId),
  })

  const items = (query.data?.pages ?? []).flatMap((p) => p.collections)

  const setSentinelRef = useInfiniteScroll(
    () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage()
    },
    Boolean(query.hasNextPage),
    query.isFetchingNextPage
  )

  return { items, isLoading: query.isLoading, isFetchingNextPage: query.isFetchingNextPage, hasNextPage: query.hasNextPage, setSentinelRef, error: query.error, refetch: query.refetch }
}

interface PublicLinksResponse {
  links: Array<{ id: string; url: string; title: string | null; notes: string | null; createdAt: string }>
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const useExploreUserLinks = (userId: string | undefined, limit: number = 12) => {
  const query = useInfiniteQuery<PublicLinksResponse>({
    queryKey: ['explore-user-links', userId, limit] as const,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<PublicLinksResponse>>(`/explore/users/${userId}/links`, {
        params: { page: pageParam, limit },
      })
      return response.data.data as PublicLinksResponse
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: Boolean(userId),
  })

  const items = (query.data?.pages ?? []).flatMap((p) => p.links)

  const setSentinelRef = useInfiniteScroll(
    () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage()
    },
    Boolean(query.hasNextPage),
    query.isFetchingNextPage
  )

  return { items, isLoading: query.isLoading, isFetchingNextPage: query.isFetchingNextPage, hasNextPage: query.hasNextPage, setSentinelRef, error: query.error, refetch: query.refetch }
}

interface PublicCollectionLinksResponse {
  links: Array<{ id: string; url: string; title: string | null; notes: string | null; createdAt: string }>
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const useExploreUserCollectionLinks = (
  userId: string | undefined,
  collectionId: string | undefined,
  limit: number = 12
) => {
  const query = useInfiniteQuery<PublicCollectionLinksResponse>({
    queryKey: ['explore-user-collection-links', userId, collectionId, limit] as const,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<PublicCollectionLinksResponse>>(`/explore/users/${userId}/collections/${collectionId}/links`, {
        params: { page: pageParam, limit },
      })
      return response.data.data as PublicCollectionLinksResponse
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: Boolean(userId && collectionId),
  })

  const items = (query.data?.pages ?? []).flatMap((p) => p.links)

  const setSentinelRef = useInfiniteScroll(
    () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage()
    },
    Boolean(query.hasNextPage),
    query.isFetchingNextPage
  )

  return { items, isLoading: query.isLoading, isFetchingNextPage: query.isFetchingNextPage, hasNextPage: query.hasNextPage, setSentinelRef, error: query.error, refetch: query.refetch }
}


