import { useMemo } from "react";
import { ShoppingBag, Search } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";

export function Header() {
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const itemsMap = useCartStore((s) => s.items);
  const totalItems = useMemo(
    () => Object.values(itemsMap).reduce((acc, it) => acc + it.quantity, 0),
    [itemsMap]
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#0B0B0C]" />
          <span className="text-sm font-semibold tracking-wide">
            GYM STUDIO
          </span>
        </div>

        <div className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-black/50" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            placeholder="Buscar guantillas, straps, leggings…"
          />
        </div>

        <button
          onClick={() => setCartOpen(true)}
          className="relative ml-auto inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-black/5 md:ml-0"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:block">Carrito</span>

          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D8C3A5] px-1 text-xs font-semibold text-black">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}