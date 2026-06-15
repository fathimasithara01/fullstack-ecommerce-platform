import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  coupon: any | null;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, q: number) => void;
  applyCoupon: (coupon: any, amt: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      discount: 0,
      addItem: (item) => set((state) => {
        const match = state.items.find((i) => i.productId === item.productId);
        if (match) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      })),
      updateQuantity: (itemId, q) => set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? { ...i, quantity: q } : i)),
      })),
      applyCoupon: (coupon, amt) => set({ coupon, discount: amt }),
      clearCart: () => set({ items: [], coupon: null, discount: 0 }),
    }),
    { name: 'saas_cart_cache' }
  )
);