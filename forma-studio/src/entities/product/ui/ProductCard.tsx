import { Link } from "react-router-dom";
import { useState } from "react";
import { Share2 } from "lucide-react";

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

  const isSoldOut = product.soldOut === true;

  function handleQuickAdd() {
    if (isSoldOut) return;

    if ((product.sizes?.length ?? 0) <= 1) {
      const size = product.sizes?.[0] ?? "Único";
      add(product, size);
      setCartOpen(true);
      return;
    }
    setQuickAddOpen(true);
  }

  function openShare(e: React.MouseEvent, format: "post" | "story" = "post") {
    e.preventDefault();
    e.stopPropagation();
    window.open(
      `${window.location.origin}/share/${product.slug}?format=${format}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <article className="group overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {/* Imagen del producto */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F4EE]">
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="relative block h-full w-full text-left"
            aria-label="Abrir vista rápida"
          >
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-black/5 via-black/10 to-black/5" />
            )}

            <img
              src={product.images?.[0]}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={
                "h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-[1.03] " +
                (isSoldOut ? "opacity-50 grayscale" : "")
              }
              loading="lazy"
            />

            {/* Badges de la izquierda */}
            {isSoldOut ? (
              <div className="absolute left-2.5 top-2.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                Agotado
              </div>
            ) : (
              product.badge && (
                <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-black backdrop-blur-sm">
                  {product.badge}
                </div>
              )
            )}
          </button>

          {/* BOTÓN COMPARTIR — Flotante en la esquina superior derecha */}
          <button
            type="button"
            onClick={(e) => openShare(e, "post")}
            className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-black backdrop-blur-md shadow-sm transition hover:bg-white active:scale-95"
            aria-label="Compartir en Facebook"
            title="Compartir"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>

          {/* Overlay DESKTOP */}
          {!isSoldOut && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden gap-2 opacity-0 transition md:flex md:group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuickAdd();
                }}
                className="pointer-events-auto flex-1 rounded-2xl bg-[#D8C3A5] px-4 py-2 text-xs font-semibold text-black"
              >
                Añadir
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="pointer-events-auto rounded-2xl border border-white/40 bg-white/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur"
              >
                Ver
              </button>
            </div>
          )}
        </div>

        {/* Info + acciones */}
        <div className="space-y-2.5 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-[12px] font-semibold leading-tight text-black sm:text-sm">
                {product.name}
              </h3>
            </div>

            <p
              className={
                "shrink-0 text-[12px] font-bold sm:text-sm " +
                (isSoldOut ? "text-black/35 line-through" : "text-black")
              }
            >
              {formatMoney(product.price)}
            </p>
          </div>

          {/* ACCIONES MÓVIL (50% / 50% perfectas sin desbordar) */}
          <div className="flex gap-1.5 md:hidden">
            <button
              onClick={handleQuickAdd}
              disabled={isSoldOut}
              className={
                "flex-1 rounded-2xl py-2 text-[11px] font-semibold transition " +
                (isSoldOut
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-[#0B0B0C] text-white hover:bg-black/90 active:scale-95")
              }
            >
              {isSoldOut ? "Agotado" : "Añadir"}
            </button>

            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex-1 rounded-2xl border border-black/10 bg-white py-2 text-[11px] font-semibold text-black hover:bg-black/5 active:scale-95"
            >
              Ver
            </button>
          </div>

          {/* Link visible en desktop */}
          <Link
            to={`/producto/${product.slug}`}
            className="hidden w-full rounded-2xl border border-black/10 bg-white py-2 text-center text-xs font-semibold hover:bg-black/5 md:block"
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