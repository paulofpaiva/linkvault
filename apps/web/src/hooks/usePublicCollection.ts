import { useInfiniteQuery, type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { ApiResponse, Link } from '@linkvault/shared';
import { toast } from 'sonner';

interface PublicCollectionMeta {
  id: string;
  // When collection is private, only isPrivate is guaranteed
  isPrivate?: boolean;
  title?: string;
  description?: string | null;
  color?: string;
  createdAt?: string;
  linkCount?: number;
}

interface PublicCollectionResponse {
  collection: PublicCollectionMeta;
  owner?: { name: string };
  links?: Link[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function usePublicCollection(id: string | undefined, limit: number = 10) {
  const query = useInfiniteQuery<PublicCollectionResponse, unknown, PublicCollectionResponse, [string, string | undefined, number]>({
    queryKey: ['public-collection', id, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<PublicCollectionResponse>>(`/public/collections/${id}`, {
        params: { page: pageParam, limit },
      });
      return response.data.data as PublicCollectionResponse;
    },
    getNextPageParam: (last) => {
      if (!last.pagination) return undefined;
      const { page, totalPages } = last.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(id),
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<PublicCollectionResponse> | undefined;
  const pages = data?.pages ?? [];
  const meta = pages[0]?.collection;
  const owner = pages[0]?.owner;
  const items = pages.flatMap((p) => p.links ?? []);

  return {
    meta,
    owner,
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  };
}

export const useClonePublicCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await api.post<ApiResponse<any>>(`/public/collections/${collectionId}/clone`);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Collection cloned successfully');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error cloning collection';
      toast.error(message);
    },
  });
};


