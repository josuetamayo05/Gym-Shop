import { useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";

import { useProduct } from "../entities/product/model/useProduct";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";

type Format = "post" | "story";
const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";

function buildFacebookText(p: Product) {
  const sizesText = p.sizes?.length ? p.sizes.join(", ") : "Única";
  return [
    `🔥 ${p.name.toUpperCase()} — JS CONCEPT`,
    `💰 Precio: ${formatMoney(p.price)}`,
    `📦 Categoría: ${p.category} · ${p.productType}`,
    `📏 Tallas/Variantes: ${sizesText}`,
    "",
    p.description ? `📝 ${p.description}` : "",
    "",
    `💬 Haz tu pedido directo por WhatsApp: https://wa.me/${WHATSAPP}?text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(p.name)}`,
  ].filter(Boolean).join("\n");
}

async function waitForImages(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

export function ProductShare() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const format = (params.get("format") as Format) || "post";

  const { product, status } = useProduct(slug ?? "");

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-sm text-black/60">Cargando plantilla…</p>
      </main>
    );
  }

  if (status === "not-found" || status === "error" || !product) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-sm text-black/70">Producto no encontrado.</p>
        <Link className="mt-4 inline-block text-xs font-semibold underline" to="/">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return <ProductShareView product={product} format={format} />;
}

function ProductShareView({ product: p, format }: { product: Product; format: Format }) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const text = useMemo(() => buildFacebookText(p), [p]);

  const frameClass =
    format === "story" ? "w-[380px] aspect-[9/16]" : "w-[380px] aspect-[4/5]";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      prompt("Copia este texto para tu publicación:", text);
    }
  }

  async function handleDownload() {
    if (!frameRef.current) return;
    setDownloading(true);

    try {
      await waitForImages(frameRef.current);

      const canvas = await html2canvas(frameRef.current, {
        backgroundColor: "#000000",
        scale: 3,
        useCORS: true,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File([blob], `${p.slug}-promo.png`, { type: "image/png" });

      const nav = navigator as Navigator & {
        share?: (data: { files?: File[]; title?: string }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };

      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "JS CONCEPT Promo" });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.slug}-promo.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // Galería de miniaturas secundarias (rellena con las fotos del producto o repetidas)
  const thumbnails = useMemo(() => {
    const imgs = p.images ?? [];
    if (imgs.length >= 5) return imgs.slice(0, 5);
    const result = [...imgs];
    while (result.length < 5) {
      result.push(imgs[0] || "/placeholder.jpg");
    }
    return result;
  }, [p.images]);

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#0B0B0C] px-4 py-8">
      <div className="mx-auto max-w-4xl text-white">
        {/* BARRA SUPERIOR DE ACCIONES */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link to={`/producto/${p.slug}`} className="text-xs font-semibold text-white/70 hover:text-white underline">
              Ver en tienda
            </Link>
            <Link to="/" className="text-xs font-semibold text-white/70 hover:text-white underline">
              Catálogo
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20 active:scale-95 transition"
            >
              {copied ? "¡Copiado!" : "Copiar Texto FB"}
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-full bg-[#D8C3A5] px-5 py-2 text-xs font-semibold text-black hover:brightness-110 active:scale-95 disabled:opacity-60 transition"
            >
              {downloading ? "Generando PNG..." : "Guardar Anuncio PNG"}
            </button>
          </div>
        </div>

        {/* ── PLANTILLA DE ANUNCIO DE FACEBOOK (IDÉNTICA A LA FOTO) ── */}
        <div className="flex justify-center">
          <div
            ref={frameRef}
            className={`${frameClass} relative overflow-hidden rounded-[28px] bg-[#111112] text-white shadow-2xl flex flex-col justify-between p-5`}
          >
            {/* FOTO PRINCIPAL DE FONDO CON FILTRO SUAVE */}
            <div className="absolute inset-0 z-0">
              <img
                src={p.images?.[0]}
                alt={p.name}
                className="h-full w-full object-cover object-center brightness-90"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60" />
            </div>

            {/* ENCABEZADO SUPERIOR DEL ANUNCIO */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="font-serif text-2xl font-normal italic tracking-tight text-white leading-none block">
                  JS
                </span>
                <span className="text-[10px] font-medium tracking-widest text-white/80 uppercase">
                  JS Concept
                </span>
              </div>

              <div className="text-right max-w-[60%]">
                <p className="text-[10px] font-bold tracking-wider text-white uppercase truncate">
                  {p.name}
                </p>
                <p className="text-[9px] tracking-widest text-white/60 uppercase">
                  {p.category} · {p.productType}
                </p>
              </div>
            </div>

            {/* PANEL INFERIOR CON DATOS DE PRODUCTO + PRECIO */}
            <div className="relative z-10 space-y-3">
              <div className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-md p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                    {p.badge ?? "DESTACADO"}
                  </span>
                  <span className="text-[10px] text-white/70">
                    Tallas: {p.sizes?.join(", ") || "Única"}
                  </span>
                </div>

                <h2 className="text-lg font-bold uppercase leading-tight text-white">
                  {p.name}
                </h2>

                {p.description && (
                  <p className="text-[11px] leading-relaxed text-white/80 line-clamp-2">
                    {p.description}
                  </p>
                )}

                <div className="flex items-end justify-between pt-1">
                  <span className="text-[10px] tracking-wider text-white/60 uppercase">
                    JS CONCEPT SELECTION
                  </span>
                  <p className="text-2xl font-bold tracking-tight text-white">
                    {formatMoney(p.price)}
                  </p>
                </div>
              </div>

              {/* FILA INFERIOR DE 5 MINIATURAS (GALERÍA DE DETALLES) */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {thumbnails.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-xl border border-white/20 bg-white/10"
                  >
                    <img
                      src={imgUrl}
                      alt="detail"
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}