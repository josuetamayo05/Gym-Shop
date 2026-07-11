import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductBySlug } from "../entities/product/model/selectors";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";
import { formatMoney } from "../utils/money";

export function ProductDetail() {
  const { slug } = useParams();

  const product = useMemo(() => {
    if (!slug) return undefined;
    return getProductBySlug(slug);
  }, [slug]);

  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const [size, setSize] = useState<string>("");

  if (!product) {
    return <div className="mx-auto max-w-4xl px-4 py-10">Producto no encontrado.</div>;
  }

  const selectedSize = size || product.sizes[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-black/5">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-black/50">{product.category}</p>
          <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-lg font-semibold">{formatMoney(product.price)}</p>

          {product.description && (
            <p className="mt-3 text-sm text-black/70">{product.description}</p>
          )}

          <div className="mt-6">
            <p className="text-sm font-semibold">Talla</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = selectedSize === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white hover:bg-black/5"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              add(product, selectedSize);
              setCartOpen(true);
            }}
            className="mt-6 w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black"
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </main>
  );
}