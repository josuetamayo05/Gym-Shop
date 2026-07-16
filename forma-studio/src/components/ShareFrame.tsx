import { forwardRef, useMemo } from "react";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";

type Format = "post" | "story";

function absUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

export const ShareFrame = forwardRef<
  HTMLDivElement,
  { product: Product; format: Format; whatsapp: string }
>(function ShareFrame({ product: p, format, whatsapp }, ref) {
  const images = p.images?.length ? p.images : ["/products/placeholder.jpg"];
  const collage = images.slice(0, 4);

  const sizes = useMemo(() => (p.sizes?.length ? p.sizes : ["Consultar"]), [p.sizes]);
  const priceText = formatMoney(p.price);

  const frameClass =
    format === "story" ? "w-[360px] aspect-[9/16]" : "w-[360px] aspect-[4/5]";

  return (
    <div
      ref={ref}
      className={`${frameClass} overflow-hidden rounded-[28px] bg-[#F7F3EE]`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold tracking-widest text-black/70">
          GYM STUDIO
        </p>
        <p className="text-[11px] font-semibold text-black/50">
          WhatsApp: +{whatsapp || "—"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4">
        <div className="col-span-2 overflow-hidden rounded-2xl bg-black/10">
          <img
            src={absUrl(collage[0])}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid gap-2">
          {[collage[1], collage[2], collage[3]].map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-black/10">
              {src ? (
                <img
                  src={absUrl(src)}
                  alt={`${p.name} ${i + 2}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 pt-4">
        <p className="text-xs uppercase tracking-widest text-black/50">
          {p.category} · {p.productType}
        </p>

        <h1 className="mt-1 text-lg font-semibold leading-snug">{p.name}</h1>
        <p className="mt-2 text-2xl font-semibold">{priceText}</p>

        <p className="mt-2 text-sm text-black/70">
          {p.description || "Producto disponible. Consulta por detalles y tallas."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.slice(0, 8).map((s) => (
            <span
              key={s}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-[#0B0B0C] px-4 py-3 text-center text-sm font-semibold text-white">
          Pedido por WhatsApp · Respuesta rápida
        </div>
      </div>
    </div>
  );
});