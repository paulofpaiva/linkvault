import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse } from '@linkvault/shared';
import type { CollectionsResponse, CreateCollectionInput, UpdateCollectionInput } from '@linkvault/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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