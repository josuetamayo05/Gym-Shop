import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { getProductBySlug } from "../entities/product/model/selectors";
import { ProductGallery } from "../components/ProductGallery";
import { formatMoney } from "../utils/money";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";

export function ProductDetail() {
  const { slug } = useParams();
  return <ProductDetailView key={slug} slug={slug ?? ""} />;
}

function ProductDetailView({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const product = useMemo(() => {
    if (!slug) return undefined;
    return getProductBySlug(slug);
  }, [slug]);

  const [size, setSize] = useState<string>("");

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <button
          onClick={() => navigate("/")}
          className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
        >
          Volver al catálogo
        </button>

        <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-6 text-sm text-black/60">
          Producto no encontrado.
        </div>
      </main>
    );
  }

  const sizes = product.sizes?.length ? product.sizes : ["Único"];
  const selectedSize = size || sizes[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>

        <Link to="/" className="text-sm font-semibold text-black/60 hover:text-black">
          Catálogo
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProductGallery key={product.id} images={product.images} alt={product.name} />

        <div className="lg:pl-2">
          <p className="text-xs uppercase tracking-widest text-black/50">
            {product.category}
          </p>

          <h1 className="mt-2 text-2xl font-semibold leading-tight">
            {product.name}
          </h1>

          <p className="mt-2 text-lg font-semibold">
            {formatMoney(product.price)}
          </p>

          {product.description && (
            <p className="mt-3 text-sm text-black/70">{product.description}</p>
          )}

          <div className="mt-6">
            <p className="text-sm font-semibold">Talla</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((s) => {
                const active = selectedSize === s;
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
            onClick={() => {
              add(product, selectedSize);
              setCartOpen(true);
            }}
            className="mt-6 w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black"
          >
            Añadir al carrito
          </button>

          <p className="mt-2 text-xs text-black/50">
            Luego enviás el pedido por WhatsApp desde el carrito.
          </p>
        </div>
      </section>
    </main>
  );
}