import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';

export const useAuth = () => {
  const store = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      store.setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: Record<string, string>) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      store.setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user as User;
    },
    enabled: store.isAuthenticated,
    retry: false,
  });

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending || store.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: store.logout,
    error: loginMutation.error || registerMutation.error,
  };
};