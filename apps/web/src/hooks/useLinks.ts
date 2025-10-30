import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type { LinksResponse, ApiResponse, CreateLinkInput, UpdateLinkInput } from '@linkvault/shared';

type LinkFilter = 'all' | 'unread' | 'archived' | 'favorites';

export const useLinks = (filter: LinkFilter = 'all', page: number = 1) => {
  return useQuery({
    queryKey: ['links', filter, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 10 };
      
      if (filter === 'favorites') {
        params.favorite = true;
      } else if (filter !== 'all') {
        params.status = filter;
      }

      const response = await api.get<ApiResponse<LinksResponse>>('/links', { params });
      return response.data.data;
    },
  });
};

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

      queryClient.setQueriesData<LinksResponse>({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          links: old.links.map((link) =>
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

      queryClient.setQueriesData<LinksResponse>({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          links: old.links.map((link) =>
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

      queryClient.setQueriesData({ queryKey: ['links'] }, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          links: old.links.map((link: any) =>
            link.id === linkId ? { ...link, isFavorite: !link.isFavorite } : link
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link updated!');
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

      queryClient.setQueriesData<LinksResponse>({ queryKey: ['links'] }, (old) => {
        if (!old) return old;

        return {
          ...old,
          links: old.links.filter((link) => link.id !== linkId),
        };
      });

      return { previousData };
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Link deleted!');
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
    },
  });
};
