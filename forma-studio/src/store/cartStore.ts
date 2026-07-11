// src/store/cartStore.ts
import { create } from "zustand";
import type { Product, CartItem } from "../types";

function makeKey(productId: string, size: string) {
  return `${productId}__${size}`;
}

type CartState = {
  items: Record<string, CartItem>;
  add: (product: Product, size: string) => void;
  remove: (key: string) => void;
  setQty: (key: string, quantity: number) => void;
  clear: () => void;

  
};

export const useCartStore = create<CartState>((set) => ({
  items: {},

  add: (product, size) =>
    set((state) => {
      const key = makeKey(product.id, size);
      const existing = state.items[key];
      const quantity = existing ? existing.quantity + 1 : 1;

      return {
        items: {
          ...state.items,
          [key]: { key, product, size, quantity },
        },
      };
    }),

  remove: (key) =>
    set((state) => {
      const copy = { ...state.items };
      delete copy[key];
      return { items: copy };
    }),

  setQty: (key, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const copy = { ...state.items };
        delete copy[key];
        return { items: copy };
      }
      const existing = state.items[key];
      if (!existing) return state;

      return {
        items: {
          ...state.items,
          [key]: { ...existing, quantity },
        },
      };
    }),

  clear: () => set({ items: {} }),
}));