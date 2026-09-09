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

  function openShare(format: "post" | "story" = "post") {
    window.open(
      `${window.location.origin}/share/${product.slug}?format=${format}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <article className="group overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {/* Imagen */}
        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className="relative block w-full text-left"
          aria-label="Abrir vista rápida"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F4EE]">
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

            {isSoldOut && (
              <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold text-white">
                Agotado
              </div>
            )}

            {!isSoldOut && product.badge && (
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black backdrop-blur">
                {product.badge}
              </div>
            )}
          </div>
        </button>

        {/* Info estilo mockup */}
        <div className="space-y-3 p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-black sm:text-sm">
                {product.name}
              </h3>
            </div>

            <p
              className={
                "shrink-0 text-[13px] font-semibold sm:text-sm " +
                (isSoldOut ? "text-black/35 line-through" : "text-black")
              }
            >
              {formatMoney(product.price)}
            </p>
          </div>

          {/* Acciones móvil */}
          <div className="flex gap-2 md:hidden">
            <button
              onClick={handleQuickAdd}
              disabled={isSoldOut}
              className={
                "flex-1 rounded-2xl px-3 py-2 text-xs font-semibold " +
                (isSoldOut
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-[#0B0B0C] text-white hover:bg-black/90")
              }
            >
              {isSoldOut ? "Agotado" : "Añadir"}
            </button>

            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex-1 rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold hover:bg-black/5"
            >
              Ver
            </button>

            <button
              onClick={() => openShare("post")}
              className="shrink-0 rounded-2xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5"
              aria-label="Compartir"
              title="Compartir"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop */}
          <div className="hidden gap-2 md:flex">
            <button
              onClick={handleQuickAdd}
              disabled={isSoldOut}
              className={
                "flex-1 rounded-2xl px-3 py-2 text-xs font-semibold " +
                (isSoldOut
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-[#D8C3A5] text-black hover:brightness-95")
              }
            >
              {isSoldOut ? "Agotado" : "Añadir"}
            </button>

            <Link
              to={`/producto/${product.slug}`}
              className="flex-1 rounded-2xl border border-black/10 bg-white px-3 py-2 text-center text-xs font-semibold hover:bg-black/5"
            >
              Ver detalle
            </Link>
          </div>
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