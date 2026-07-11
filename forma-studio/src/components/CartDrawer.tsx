import * as Dialog from "@radix-ui/react-dialog";
import { useMemo } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useCartStore } from "../store/cartStore";
import { formatMoney } from "../utils/money";
import { buildWhatsAppLink, buildWhatsAppMessage } from "../utils/whatsapp";

const PHONE = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";

export function CartDrawer() {
  const cartOpen = useUIStore((s) => s.cartOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  // IMPORTANTE: traemos el objeto items (estable) desde el store
  const itemsMap = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  // Convertimos a array fuera del selector (evita loop infinito)
  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);

  const totalItems = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((acc, it) => acc + it.product.price * it.quantity, 0),
    [items]
  );

  const canSend = items.length > 0 && PHONE.length > 0;

  function handleWhatsApp() {
    const msg = buildWhatsAppMessage(items);
    const url = buildWhatsAppLink(PHONE, msg);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />

        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-black/10 bg-white outline-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 p-4">
            <div>
              <Dialog.Title className="text-base font-semibold">
                Tu carrito
              </Dialog.Title>
              <p className="text-xs text-black/60">{totalItems} artículo(s)</p>
            </div>

            <Dialog.Close className="rounded-xl p-2 hover:bg-black/5">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Items */}
          <div className="h-[calc(100%-168px)] overflow-auto p-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
                Tu carrito está vacío.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3 rounded-2xl border border-black/10 p-3"
                  >
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-black/60">
                            {formatMoney(item.product.price)} · Talla:{" "}
                            <span className="font-semibold text-black/80">
                              {item.size}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => remove(item.key)}
                          className="rounded-xl p-2 hover:bg-black/5"
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-black/10 p-1">
                        <button
                          onClick={() => setQty(item.key, item.quantity - 1)}
                          className="rounded-xl p-2 hover:bg-black/5"
                          aria-label="Restar"
                          title="Restar"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => setQty(item.key, item.quantity + 1)}
                          className="rounded-xl p-2 hover:bg-black/5"
                          aria-label="Sumar"
                          title="Sumar"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-black/10 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-black/60">Total</span>
              <span className="text-base font-semibold">
                {formatMoney(totalPrice)}
              </span>
            </div>

            <button
              disabled={!canSend}
              onClick={handleWhatsApp}
              className="mt-3 w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar pedido por WhatsApp
            </button>

            {!PHONE && (
              <p className="mt-2 text-xs text-red-600">
                Falta configurar <b>VITE_WHATSAPP_PHONE</b> en <b>.env</b>
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}