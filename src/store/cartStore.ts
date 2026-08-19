import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity > 0 
            ? state.items.map((i) => (i.id === productId ? { ...i, quantity } : i))
            : state.items.filter((i) => i.id !== productId)
        })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce-cart',
    }
  )
);
