import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../types";
import { formatMoney } from "../utils/money";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";
import { QuickAddDialog } from "./QuickAddDialog";

export function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  function handleQuickAdd() {
    // Si solo tiene un talle (ej: "Único"), lo agregamos directo sin modal
    if (product.sizes.length === 1) {
      add(product, product.sizes[0]);
      setCartOpen(true);
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border border-black/10 bg-white">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          {product.badge && (
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black backdrop-blur">
              {product.badge}
            </div>
          )}

          {/* Quick Add overlay (desktop hover) */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 opacity-0 transition group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <button
              onClick={handleQuickAdd}
              className="pointer-events-auto w-full rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black"
            >
              Añadir
            </button>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight">
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-black/60">{product.category}</p>
            </div>
            <p className="text-sm font-semibold">{formatMoney(product.price)}</p>
          </div>

          {/* Acciones (mobile/siempre visibles) */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
            <button
              onClick={handleQuickAdd}
              className="rounded-2xl bg-[#0B0B0C] px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 md:hidden"
            >
              Añadir
            </button>

            <Link
              to={`/producto/${product.id}`}
              className="col-span-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-center text-sm font-semibold hover:bg-black/5 md:col-span-2"
            >
              Ver detalle
            </Link>
          </div>
        </div>
      </article>

      <QuickAddDialog product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}