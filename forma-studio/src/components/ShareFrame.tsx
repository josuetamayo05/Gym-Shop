import { forwardRef } from "react";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";

type Format = "story" | "post" | "shein";

function absUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

function clampText(text: string, max = 90) {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

export const ShareFrame = forwardRef<
  HTMLDivElement,
  { product: Product; format: Format; whatsapp: string }
>(function ShareFrame({ product: p, format }, ref) {
  const images = p.images?.length ? p.images : ["/products/placeholder.jpg"];
  const main = images[0];

  const priceText = formatMoney(p.price);

  const frameClass =
    format === "story"
      ? "w-[360px] aspect-[9/16]" // 1080x1920 al exportar con scale:3
      : format === "post"
        ? "w-[360px] aspect-[4/5]"
        : "w-[360px] aspect-[3/4]";

  // STORY: miniaturas fijas
  const THUMBS_COUNT = 4;
  const thumbs = images.slice(0, THUMBS_COUNT);
  const more = Math.max(0, images.length - thumbs.length);

  // Algoritmo anti-corte:
  // - Si el nombre es largo, baja font.
  // - Si es MUY largo, quita descripción (para asegurar nombre+precio).
  const nameLen = p.name.length;
  const nameClass =
    nameLen > 58 ? "text-sm" : nameLen > 42 ? "text-base" : "text-lg";
  const showDesc = Boolean(p.description) && nameLen <= 58;

  // Story: descripción corta (si se muestra)
  const descText = clampText(p.description ?? "", 78);

  if (format === "story") {
    return (
      <div
        ref={ref}
        className={`${frameClass} relative overflow-hidden rounded-[28px] bg-black`}
      >
        {/* Imagen full */}
        <img
          src={absUrl(main)}
          alt={p.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Degradado inferior para que siempre se lean letras */}
        <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* Contenido inferior */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          {/* Texto + precio */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                {p.category} · {p.productType}
              </p>

              <h1
                className={`mt-1 leading-snug font-semibold text-white ${nameClass}`}
                style={{
                  // evita que una palabra larguísima rompa el layout
                  wordBreak: "break-word",
                }}
              >
                {p.name}
              </h1>

              {showDesc && (
                <p className="mt-1 text-xs text-white/80">{descText}</p>
              )}
            </div>

            {/* Precio SIEMPRE visible */}
            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold text-white">{priceText}</p>
            </div>
          </div>

          {/* Miniaturas (fijas, sin solape) */}
          <div className="mt-3 flex gap-2">
            {thumbs.map((src, i) => {
              const isLast = i === thumbs.length - 1;
              const showMoreBadge = isLast && more > 0;

              return (
                <div
                  key={src + i}
                  className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/15 bg-white/10"
                >
                  <img
                    src={absUrl(src)}
                    alt={`${p.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {showMoreBadge && (
                    <div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-semibold text-white">
                      +{more}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // POST / SHEIN: simple (si luego quieres lo ajustamos)
  return (
    <div
      ref={ref}
      className={`${frameClass} flex flex-col overflow-hidden rounded-[28px] bg-white`}
    >
      <div className="px-4 pt-4">
        <div className="overflow-hidden rounded-3xl bg-black/5">
          <div className="aspect-[4/5]">
            <img src={absUrl(main)} alt={p.name} className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="pb-4 pt-4">
          <p className="text-xs uppercase tracking-widest text-black/50">
            {p.category} · {p.productType}
          </p>
          <h1 className="mt-1 text-base font-semibold leading-snug text-black">{p.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-black">{priceText}</p>
          {p.description && <p className="mt-2 text-sm text-black/70">{p.description}</p>}
        </div>
      </div>
    </div>
  );
});