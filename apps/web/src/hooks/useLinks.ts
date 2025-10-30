import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { LinksResponse, ApiResponse, CreateLinkInput, UpdateLinkInput, Link as LinkType } from '@linkvault/shared';
import { useInfiniteScroll } from './useInfiniteScroll';

type LinkFilter = 'all' | 'unread' | 'archived' | 'favorites';

export const useLinks = (filter: LinkFilter = 'all', limit: number = 5) => {
  const query = useInfiniteQuery<LinksResponse, unknown, LinksResponse, [string, LinkFilter, number]>({
    queryKey: ['links', filter, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, unknown> = { page: pageParam, limit };

      if (filter === 'favorites') {
        params.favorite = true;
      } else if (filter !== 'all') {
        params.status = filter;
      }

      const response = await api.get<ApiResponse<LinksResponse>>('/links', { params });
      return response.data.data as LinksResponse;
    },
    getNextPageParam: (lastPage: LinksResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<LinksResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p: LinksResponse) => p.links);
  const hasMore = Boolean(query.hasNextPage);
  const setSentinelRef = useInfiniteScroll(
    () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    hasMore,
    query.isFetchingNextPage
  );

  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
    setSentinelRef,
  };
};

export const useAllLinks = (limit: number = 10, search: string = '', excludeCollectionId?: string) => {
  const query = useInfiniteQuery<LinksResponse, unknown, LinksResponse, [string, number, string, string | undefined]>({
    queryKey: ['all-links', limit, search, excludeCollectionId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<LinksResponse>>('/links', {
        params: { page: pageParam, limit, search: search || undefined, excludeCollectionId },
      });
      return response.data.data as LinksResponse;
    },
    getNextPageParam: (lastPage: LinksResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<LinksResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p) => p.links);

  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  };
};

export const usePublicLinks = (limit: number = 10, search: string = '', excludeCollectionId?: string) => {
  const query = useInfiniteQuery<LinksResponse, unknown, LinksResponse, [string, number, string, string | undefined]>({
    queryKey: ['public-links', limit, search, excludeCollectionId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<LinksResponse>>('/links/public', {
        params: { page: pageParam, limit, search: search || undefined, excludeCollectionId },
      });
      return response.data.data as LinksResponse;
    },
    getNextPageParam: (lastPage: LinksResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<LinksResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p) => p.links);
  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  };
};

export const usePrivateLinks = (limit: number = 10, search: string = '', excludeCollectionId?: string) => {
  const query = useInfiniteQuery<LinksResponse, unknown, LinksResponse, [string, number, string, string | undefined]>({
    queryKey: ['private-links', limit, search, excludeCollectionId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<LinksResponse>>('/links/private', {
        params: { page: pageParam, limit, search: search || undefined, excludeCollectionId },
      });
      return response.data.data as LinksResponse;
    },
    getNextPageParam: (lastPage: LinksResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<LinksResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p) => p.links);

  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  };
};

function isInfiniteLinksData(
  value: unknown
): value is InfiniteData<LinksResponse> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pages' in (value as Record<string, unknown>)
  );
}

function hasFavorite(
  value: unknown
): value is LinkType & { isFavorite: boolean } {
  return typeof value === 'object' && value !== null && 'isFavorite' in value;
}

export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLinkInput) => {
      const response = await api.post<ApiResponse<any>>('/links', data);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link created successfully!');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error creating link';
      toast.error(message);
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLinkInput }) => {
      const response = await api.patch<ApiResponse<any>>(`/links/${id}`, data);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-links'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['collection'], exact: false });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error updating link';
      toast.error(message);
    },
  });
};

export const useToggleRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.patch<ApiResponse<any>>(`/links/${linkId}/read`);
      return response.data;
    },
    onMutate: async (linkId: string) => {
      await queryClient.cancelQueries({ queryKey: ['links'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['links'] });

      queryClient.setQueriesData({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        if (isInfiniteLinksData(old)) {
          return {
            ...old,
            pages: old.pages.map((page: LinksResponse) => ({
              ...page,
              links: page.links.map((link: LinkType) =>
                link.id === linkId
                  ? { ...link, status: link.status === 'read' ? 'unread' : 'read' }
                  : link
              ),
            })),
          };
        }

        return {
          ...old,
          links: (old as LinksResponse).links.map((link: LinkType) =>
            link.id === linkId
              ? { ...link, status: link.status === 'read' ? 'unread' : 'read' }
              : link
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link status updated!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any, _linkId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = error.response?.data?.message || 'Error updating link status';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-links'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['collection'], exact: false });
    },
  });
};

export const useArchiveLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.patch<ApiResponse<any>>(`/links/${linkId}/archive`);
      return response.data;
    },
    onMutate: async (linkId: string) => {
      await queryClient.cancelQueries({ queryKey: ['links'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['links'] });

      queryClient.setQueriesData({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        if (isInfiniteLinksData(old)) {
          return {
            ...old,
            pages: old.pages.map((page: LinksResponse) => ({
              ...page,
              links: page.links.map((link: LinkType) =>
                link.id === linkId
                  ? { ...link, status: link.status === 'archived' ? 'unread' : 'archived' }
                  : link
              ),
            })),
          };
        }

        return {
          ...old,
          links: (old as LinksResponse).links.map((link: LinkType) =>
            link.id === linkId
              ? { ...link, status: link.status === 'archived' ? 'unread' : 'archived' }
              : link
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link updated!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any, _linkId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = error.response?.data?.message || 'Error updating link';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-links'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['collection'], exact: false });
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.patch<ApiResponse<any>>(`/links/${linkId}/favorite`);
      return response.data;
    },
    onMutate: async (linkId: string) => {
      await queryClient.cancelQueries({ queryKey: ['links'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['links'] });

      queryClient.setQueriesData({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        if (isInfiniteLinksData(old)) {
          return {
            ...old,
            pages: old.pages.map((page: LinksResponse) => ({
              ...page,
              links: page.links.map((link) => {
                if (link.id === linkId && hasFavorite(link)) {
                  return { ...link, isFavorite: !link.isFavorite };
                }
                return link;
              }),
            })),
          };
        }

        return {
          ...old,
          links: (old as LinksResponse).links.map((link) => {
            if (link.id === linkId && hasFavorite(link)) {
              return { ...link, isFavorite: !link.isFavorite };
            }
            return link;
          }),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link updated!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any, _linkId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = error.response?.data?.message || 'Error updating link';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-links'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['collection'], exact: false });
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.delete<ApiResponse<any>>(`/links/${linkId}`);
      return response.data;
    },
    onMutate: async (linkId: string) => {
      await queryClient.cancelQueries({ queryKey: ['links'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['links'] });

      queryClient.setQueriesData({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        if (isInfiniteLinksData(old)) {
          return {
            ...old,
            pages: old.pages.map((page: LinksResponse) => ({
              ...page,
              links: page.links.filter((link: LinkType) => link.id !== linkId),
            })),
          };
        }

        return {
          ...old,
          links: (old as LinksResponse).links.filter((link: LinkType) => link.id !== linkId),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link deleted!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any, _linkId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = error.response?.data?.message || 'Error deleting link';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-links'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['collection'], exact: false });
    },
  });
};