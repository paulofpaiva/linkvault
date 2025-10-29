import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { ApiResponse, CreateCategoryInput, UpdateCategoryInput, Category } from '@linkvault/shared';

interface CategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useCategories = (page: number = 1) => {
  return useQuery({
    queryKey: ['categories', page],
    queryFn: async () => {      
      const response = await api.get<ApiResponse<CategoriesResponse>>('/categories', {
        params: { page, limit: 20 },
      });
      return response.data.data;
    },
  });
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

      queryClient.setQueriesData<CategoriesResponse>({ queryKey: ['categories'] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          categories: old.categories.filter((cat) => cat.id !== categoryId),
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
    },
  });
};

export type { CategoriesResponse };

