import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { Product } from "../types";
import { formatMoney } from "../utils/money";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";
import { ProductGallery } from "./ProductGallery";

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const sizes = useMemo(
    () => (product.sizes?.length ? product.sizes : ["Único"]),
    [product.sizes]
  );

  const defaultSize = useMemo(() => sizes[0], [sizes]);
  const [size, setSize] = useState(defaultSize);

  function handleOpenChange(next: boolean) {
    if (next) setSize(defaultSize);
    onOpenChange(next);
  }

  function handleAdd() {
    add(product, size || defaultSize);
    onOpenChange(false);
    setCartOpen(true);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-black/10 bg-white outline-none">
          <div className="flex items-center justify-between border-b border-black/10 p-4">
            <Dialog.Title className="text-sm font-semibold">
              Vista rápida
            </Dialog.Title>
            <Dialog.Close className="rounded-xl p-2 hover:bg-black/5">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="max-h-[80vh] overflow-auto p-4">
            <div className="grid gap-5 md:grid-cols-2">
              <ProductGallery
                key={product.id}
                images={product.images}
                alt={product.name}
              />

              <div>
                <p className="text-xs uppercase tracking-widest text-black/50">
                  {product.category} · {product.productType}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
                <p className="mt-2 text-base font-semibold">
                  {formatMoney(product.price)}
                </p>

                {product.description && (
                  <p className="mt-3 text-sm text-black/70">
                    {product.description}
                  </p>
                )}

                <div className="mt-5">
                  <p className="text-sm font-semibold">Talla</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const active = s === size;
                      return (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={
                            "rounded-2xl border px-4 py-2 text-sm font-semibold transition " +
                            (active
                              ? "border-black bg-black text-white"
                              : "border-black/10 bg-white hover:bg-black/5")
                          }
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="mt-5 w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black"
                >
                  Añadir al carrito
                </button>

                <Link
                  to={`/producto/${product.slug}`}
                  className="mt-2 block w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-black/5"
                  onClick={() => onOpenChange(false)}
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}