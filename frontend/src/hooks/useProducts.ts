import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Product } from '../types';

interface FetchParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
}

export const useProducts = (params?: FetchParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/products', { params });
      return res.data;
    },
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/slug/${slug}`);
      return res.data.data as { product: Product; related: Product[] };
    },
  });
};