import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { 
  LoginInput, 
  RegisterInput, 
  AuthResponse, 
  ApiResponse,
} from '@linkvault/shared';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        data,
        { skipAuthRefresh: true }
      );
      return response.data;
    },
    onSuccess: (response) => {
      if (response.isSuccess && response.data) {
        const { accessToken, user } = response.data;
        setAuth(user, accessToken);
        navigate('/links');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error logging in';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        data,
        { skipAuthRefresh: true }
      );
      return response.data;
    },
    onSuccess: (response) => {
      if (response.isSuccess && response.data) {
        const { accessToken, user } = response.data;
        setAuth(user, accessToken);
        toast.success(response.message || 'Account created successfully!');
        navigate('/links');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error creating account';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      navigate('/');
    },
    onError: (error: any) => {
      logout();
      navigate('/');
      const message = error.response?.data?.message || 'Error logging out';
      toast.error(message);
    },
  });
};

export const useDeleteAccount = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await api.delete('/auth/account');
    },
    onSuccess: () => {
      queryClient.clear();
      logout();
      toast.success('Account deleted successfully');
      navigate('/');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error deleting account';
      toast.error(message);
    },
  });
};