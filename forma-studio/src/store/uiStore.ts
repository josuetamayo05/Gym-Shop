import { create } from "zustand";

type UIState = {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
}));