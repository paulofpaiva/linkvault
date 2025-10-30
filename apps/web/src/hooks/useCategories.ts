import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { ApiResponse, CreateCategoryInput, UpdateCategoryInput, Category } from '@linkvault/shared';
import { useInfiniteScroll } from './useInfiniteScroll';

interface CategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useCategories = (limit: number = 5) => {
  const query = useInfiniteQuery<CategoriesResponse, unknown, CategoriesResponse, [string, number]>({
    queryKey: ['categories', limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<ApiResponse<CategoriesResponse>>('/categories', {
        params: { page: pageParam, limit },
      });
      return response.data.data as CategoriesResponse;
    },
    getNextPageParam: (lastPage: CategoriesResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const data = query.data as InfiniteData<CategoriesResponse> | undefined;
  const items = (data?.pages ?? []).flatMap((p) => p.categories);
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

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      const response = await api.post<ApiResponse<Category>>('/categories', data);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Category created successfully!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error creating category';
      toast.error(message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
      const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Category updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error updating category';
      toast.error(message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await api.delete<ApiResponse<any>>(`/categories/${categoryId}`);
      return response.data;
    },
    onMutate: async (categoryId: string) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['categories'] });

      queryClient.setQueriesData({ queryKey: ['categories'] }, (old) => {
        if (!old) return old;

        if (isInfiniteCategoriesData(old)) {
          return {
            ...old,
            pages: old.pages.map((page: CategoriesResponse) => ({
              ...page,
              categories: page.categories.filter((cat) => cat.id !== categoryId),
            })),
          };
        }

        const single = old as CategoriesResponse;
        return {
          ...single,
          categories: single.categories.filter((cat) => cat.id !== categoryId),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Category deleted!');
    },
    onError: (error: any, _categoryId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = error.response?.data?.message || 'Error deleting category';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export type { CategoriesResponse };

function isInfiniteCategoriesData(
  value: unknown
): value is InfiniteData<CategoriesResponse> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pages' in (value as Record<string, unknown>)
  );
}

