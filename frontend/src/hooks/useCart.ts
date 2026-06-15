import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const queryClient = useQueryClient();
  const store = useCartStore();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: { productId: string; quantity: number }) => {
      const res = await api.post('/cart', payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.delete(`/cart/item/${itemId}`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  return {
    cart: cartQuery.data?.items || store.items,
    isLoading: cartQuery.isLoading,
    addItem: addMutation.mutateAsync,
    removeItem: removeMutation.mutateAsync,
  };
};