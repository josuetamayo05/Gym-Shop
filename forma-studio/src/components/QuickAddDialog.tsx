import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "../types";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";
import { formatMoney } from "../utils/money";

export function QuickAddDialog({
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

  const defaultSize = useMemo(
    () => (product.sizes?.[0] ? product.sizes[0] : "Único"),
    [product.sizes]
  );

  const [size, setSize] = useState<string>(defaultSize);

  function handleOpenChange(nextOpen: boolean) {
    // Resetea el talle al abrir (sin useEffect)
    if (nextOpen) setSize(defaultSize);
    onOpenChange(nextOpen);
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

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-black/10 bg-white outline-none">
          <div className="flex items-center justify-between border-b border-black/10 p-4">
            <Dialog.Title className="text-sm font-semibold">
              Elegí talle
            </Dialog.Title>
            <Dialog.Close className="rounded-xl p-2 hover:bg-black/5">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[160px_1fr]">
            <div className="overflow-hidden rounded-2xl bg-black/5">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="h-40 w-full object-cover md:h-full"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-black/50">
                {product.category}
              </p>
              <h3 className="mt-1 text-base font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold">
                {formatMoney(product.price)}
              </p>

              <div className="mt-4">
                <p className="text-sm font-semibold">Talle</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(product.sizes?.length ? product.sizes : ["Único"]).map(
                    (s) => {
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
                    }
                  )}
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="mt-5 w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black"
              >
                Añadir al carrito
              </button>

              <p className="mt-2 text-xs text-black/50">
                Luego enviás el pedido por WhatsApp desde el carrito.
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}