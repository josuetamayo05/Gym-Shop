import { forwardRef } from "react";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";

export type ShareFormat = "photo";
export type ShareShape = "rounded" | "square";

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
  {
    product: Product;
    format: ShareFormat; // "photo"
    shape?: ShareShape;
    showPrice?: boolean; // NUEVO
  }
>(function ShareFrame({ product: p, format, shape = "square", showPrice = true }, ref) {
  const images = p.images?.length ? p.images : ["/products/placeholder.jpg"];
  const main = images[0];

  const priceText = formatMoney(p.price);

  const frameClass = "w-[360px] aspect-[4/5]"; // 1080x1350 al exportar con scale:3

  const radiusRoot = shape === "rounded" ? "rounded-[28px]" : "rounded-none";
  const radiusThumb = shape === "rounded" ? "rounded-2xl" : "rounded-none";

  const THUMBS_COUNT = 4;
  const thumbs = images.slice(0, THUMBS_COUNT);
  const more = Math.max(0, images.length - thumbs.length);

  const nameLen = p.name.length;
  const nameClass = nameLen > 62 ? "text-sm" : nameLen > 46 ? "text-base" : "text-lg";
  const showDesc = Boolean(p.description) && nameLen <= 62;
  const descText = clampText(p.description ?? "", 78);

  if (format !== "photo") return null;

  return (
    <div ref={ref} className={`${frameClass} relative overflow-hidden bg-black ${radiusRoot}`}>
      <img src={absUrl(main)} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />

      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {p.category} · {p.productType}
            </p>

            <h1 className={`mt-1 font-semibold leading-snug text-white ${nameClass}`} style={{ wordBreak: "break-word" }}>
              {p.name}
            </h1>

            {showDesc && <p className="mt-1 text-xs text-white/80">{descText}</p>}
          </div>

          {/* PRECIO opcional */}
          {showPrice && (
            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold text-white">{priceText}</p>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          {thumbs.map((src, i) => {
            const isLast = i === thumbs.length - 1;
            const showMoreBadge = isLast && more > 0;

            return (
              <div
                key={src + i}
                className={`relative h-14 w-14 overflow-hidden border border-white/15 bg-white/10 ${radiusThumb}`}
              >
                <img src={absUrl(src)} alt={`${p.name} ${i + 1}`} className="h-full w-full object-cover" />
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
});