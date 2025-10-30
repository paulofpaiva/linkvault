import { useInfiniteQuery, type InfiniteData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse, LinksResponse } from '@linkvault/shared';
import type { CollectionsResponse, CreateCollectionInput, UpdateCollectionInput, Collection } from '@linkvault/shared';
import { toast } from 'sonner';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export const useCollections = (limit: number = 12) => {
  const query = useInfiniteQuery<CollectionsResponse, unknown, CollectionsResponse, [string, number]>({
    queryKey: ['collections', limit],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit };
      const response = await api.get<ApiResponse<CollectionsResponse>>('/collections', { params });
      return response.data.data as CollectionsResponse;
    },
    getNextPageParam: (lastPage: CollectionsResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<CollectionsResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p: CollectionsResponse) => p.collections);
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
    setSentinelRef,
    refetch: query.refetch,
  };
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCollectionInput) => {
      const response = await api.post<ApiResponse<any>>('/collections', data);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Collection created successfully!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error creating collection';
      toast.error(message);
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCollectionInput }) => {
      const response = await api.patch<ApiResponse<any>>(`/collections/${id}`, data);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Collection updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error updating collection';
      toast.error(message);
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await api.delete<ApiResponse<any>>(`/collections/${collectionId}`);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Collection deleted!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error deleting collection';
      toast.error(message);
    },
  });
};

export const useCollectionDetail = (id: string | undefined) => {
  return useQuery<Collection, unknown, Collection, [string, string | undefined]>({
    queryKey: ['collection', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Collection>>(`/collections/${id}`);
      return response.data.data as Collection;
    },
    enabled: Boolean(id),
  });
};

export const useCollectionLinks = (collectionId: string | undefined, limit: number = 10) => {
  const query = useInfiniteQuery<LinksResponse, unknown, LinksResponse, [string, string | undefined, number]>({
    queryKey: ['collection-links', collectionId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<LinksResponse>>(`/collections/${collectionId}/links`, {
        params: { page: pageParam, limit },
      });
      return response.data.data as LinksResponse;
    },
    getNextPageParam: (lastPage: LinksResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(collectionId),
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<LinksResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p) => p.links);
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

export const useRemoveLinkFromCollection = (collectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.delete<ApiResponse<any>>(`/collections/${collectionId}/links/${linkId}`);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link removed from collection');
      queryClient.invalidateQueries({ queryKey: ['collection-links', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error removing link from collection';
      toast.error(message);
    },
  });
};

export const useAddLinksToCollection = (collectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (linkIds: string[]) => {
      const response = await api.post<ApiResponse<any>>(`/collections/${collectionId}/links`, { linkIds });
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Links added to collection');
      queryClient.invalidateQueries({ queryKey: ['collection-links', collectionId], exact: false });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId], exact: false });
      queryClient.invalidateQueries({ queryKey: ['public-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-links'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error adding links to collection';
      toast.error(message);
    },
  });
};