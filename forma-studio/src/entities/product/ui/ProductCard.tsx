import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../../../types";
import { formatMoney } from "../../../utils/money";
import { useCartStore } from "../../../store/cartStore";
import { useUIStore } from "../../../store/uiStore";
import { QuickAddDialog } from "../../../components/QuickAddDialog";
import { QuickViewDialog } from "../../../components/QuickViewDialog";

export function ProductCard({ product }: { product: Product }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  function handleQuickAdd() {
    if ((product.sizes?.length ?? 0) <= 1) {
      const size = product.sizes?.[0] ?? "Único";
      add(product, size);
      setCartOpen(true);
      return;
    }
    setQuickAddOpen(true);
  }

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border border-black/10 bg-white">
        {/* Imagen (abre QuickView) */}
        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className="relative block w-full text-left"
          aria-label="Abrir vista rápida"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-black/5 via-black/10 to-black/5" />
            )}

            <img
              src={product.images?.[0]}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-[1.03]"
              loading="lazy"
            />

            {product.badge && (
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black backdrop-blur">
                {product.badge}
              </div>
            )}

            {/* OVERLAY SOLO DESKTOP (para evitar solapes en móvil) */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden gap-2 opacity-0 transition md:flex md:group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickAdd();
                }}
                className="pointer-events-auto flex-1 rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black"
              >
                Añadir
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="pointer-events-auto rounded-2xl border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
              >
                Ver
              </button>
            </div>
          </div>
        </button>

        {/* Info + acciones */}
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight">
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-black/60">
                {product.category}
                {" · "}
                {product.productType}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatMoney(product.price)}</p>
          </div>

          {/* ACCIONES SOLO MÓVIL (siempre visibles y sin solaparse) */}
          <div className="flex gap-2 md:hidden">
            <button
              onClick={handleQuickAdd}
              className="flex-1 rounded-2xl bg-[#0B0B0C] px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
            >
              Añadir
            </button>
            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
            >
              Ver
            </button>
          </div>

          {/* Link visible en desktop */}
          <Link
            to={`/producto/${product.slug}`}
            className="hidden w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-center text-sm font-semibold hover:bg-black/5 md:block"
          >
            Ver detalle
          </Link>
        </div>
      </article>

      <QuickAddDialog
        product={product}
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
      />

      <QuickViewDialog
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}