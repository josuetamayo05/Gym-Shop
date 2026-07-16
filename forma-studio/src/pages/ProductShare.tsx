import { useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

import { getProductBySlug } from "../entities/product/model/selectors";
import { formatMoney } from "../utils/money";
import type { Product } from "../entities/product/model/types";
import html2canvas from "html2canvas";

const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";
type Format = "post" | "story";

function buildFacebookText(opts: {
  name: string;
  price: string;
  category: string;
  productType: string;
  sizes: string[];
  whatsapp: string;
  note?: string;
}) {
  const sizesText = opts.sizes.length ? opts.sizes.join(", ") : "Consultar";
  return [
    "GYM STUDIO",
    `${opts.category} · ${opts.productType}`,
    opts.name,
    `Precio: ${opts.price}`,
    `Tallas: ${sizesText}`,
    `WhatsApp: +${opts.whatsapp}`,
    opts.note ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function ProductShare() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const format = (params.get("format") as Format) || "post";

  const product = useMemo(() => {
    if (!slug) return undefined;
    return getProductBySlug(slug);
  }, [slug]);

  if (!product) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-black/70">Producto no encontrado.</p>
        <Link className="mt-4 inline-block underline" to="/">
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

  const images = p.images?.length ? p.images : ["/products/placeholder.jpg"];
  const collage = images.slice(0, 4);

  // Memo para que no cree arrays nuevos en cada render
  const sizes = useMemo(() => {
    return p.sizes?.length ? p.sizes : (["Consultar"] as string[]);
  }, [p.sizes]);

  const priceText = formatMoney(p.price);

  const shareText = useMemo(() => {
    return buildFacebookText({
      name: p.name,
      price: priceText,
      category: p.category,
      productType: p.productType,
      sizes,
      whatsapp: WHATSAPP,
      note: "Disponibilidad por WhatsApp. Respuesta rápida.",
    });
  }, [p.name, p.category, p.productType, priceText, sizes]);

  const frameClass =
    format === "story" ? "w-[360px] aspect-[9/16]" : "w-[360px] aspect-[4/5]";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      prompt("Copia este texto:", shareText);
    }
  }

  async function handleDownload() {
    if (!frameRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(frameRef.current, {
        backgroundColor: "#F7F3EE", // el fondo real de tu tarjeta
        scale: 3,                  // calidad alta
        useCORS: true,             // por si algún día usas imágenes externas
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File([blob], `${p.slug}-${format}.png`, { type: "image/png" });

      // Share Sheet (iPhone/Android modernos)
      const nav = navigator as Navigator & {
        share?: (data: { files?: File[]; title?: string }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };

      if (typeof nav.share === "function" && typeof nav.canShare === "function") {
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], title: "GYM STUDIO" });
          return;
        }
      }

      // Fallback: descarga normal (desktop)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.slug}-${format}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#0B0B0C] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-3">
            <Link to={`/producto/${p.slug}`} className="text-sm underline">
              Ver detalle
            </Link>
            <Link to="/" className="text-sm underline">
              Catálogo
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/share/${p.slug}?format=post`}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                format === "post" ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              Post
            </Link>
            <Link
              to={`/share/${p.slug}?format=story`}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                format === "story" ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              Story
            </Link>

            <button
              onClick={handleCopy}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
            >
              {copied ? "Copiado" : "Copiar texto"}
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-full bg-[#D8C3A5] px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
            >
              {downloading ? "Generando…" : "Guardar/Compartir PNG"}
            </button>
          </div>
        </div>

        <div
          ref={frameRef}
          className={`${frameClass} mx-auto overflow-hidden rounded-[28px] bg-[#F7F3EE]`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs font-semibold tracking-widest text-black/70">GYM STUDIO</p>
            <p className="text-[11px] font-semibold text-black/50">
              WhatsApp: +{WHATSAPP || "—"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 px-4">
            <div className="col-span-2 overflow-hidden rounded-2xl bg-black/10">
              <img src={collage[0]} alt={p.name} className="h-full w-full object-cover" />
            </div>

            <div className="grid gap-2">
              {[collage[1], collage[2], collage[3]].map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl bg-black/10">
                  {src ? (
                    <img
                      src={src}
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
      </div>
    </main>
  );
}