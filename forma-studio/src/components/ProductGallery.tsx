import { useState } from "react";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safeImages = images?.length ? images : ["/products/placeholder.jpg"];
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-3 md:grid-cols-[88px_1fr]">
      {/* Thumbs (desktop: columna) */}
      <div className="hidden md:flex md:flex-col md:gap-2">
        {safeImages.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            className={
              "overflow-hidden rounded-2xl border bg-white " +
              (i === active ? "border-black" : "border-black/10")
            }
          >
            <img src={src} alt={`${alt} ${i + 1}`} className="h-20 w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-black/5">
        <img
          src={safeImages[active]}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbs (mobile: fila scrolleable) */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 md:hidden">
        {safeImages.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            className={
              "shrink-0 overflow-hidden rounded-2xl border bg-white " +
              (i === active ? "border-black" : "border-black/10")
            }
          >
            <img src={src} alt={`${alt} ${i + 1}`} className="h-20 w-20 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}