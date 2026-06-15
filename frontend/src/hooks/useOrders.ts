import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders/history');
      return res.data.data;
    },
  });
};

export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    },
  });
};