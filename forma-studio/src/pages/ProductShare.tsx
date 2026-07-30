import { useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";

import {  } from "../entities/product/model/useProduct";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";

type Format = "post" | "story";
const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";

function buildFacebookText(p: Product) {
  const sizesText = p.sizes?.length ? p.sizes.join(", ") : "Consultar";
  return [
    "GYM STUDIO",
    `${p.category} · ${p.productType}`,
    p.name,
    `Precio: ${formatMoney(p.price)}`,
    `Tallas: ${sizesText}`,
    `WhatsApp: +${WHATSAPP}`,
  ].join("\n");
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

  const { products } = useProduct();

  const product = useMemo(() => {
    if (!slug) return undefined;
    return products.find((p) => p.slug === slug);
  }, [products, slug]);

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

  const text = useMemo(() => buildFacebookText(p), [p]);

  const frameClass =
    format === "story" ? "w-[360px] aspect-[9/16]" : "w-[360px] aspect-[4/5]";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      prompt("Copia este texto:", text);
    }
  }

  async function handleDownload() {
    if (!frameRef.current) return;
    setDownloading(true);

    try {
      await waitForImages(frameRef.current);

      const canvas = await html2canvas(frameRef.current, {
        backgroundColor: "#F7F3EE",
        scale: 3,
        useCORS: true,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File([blob], `${p.slug}-${format}.png`, { type: "image/png" });

      const nav = navigator as Navigator & {
        share?: (data: { files?: File[]; title?: string }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };

      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "GYM STUDIO" });
        return;
      }

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
      <div className="mx-auto max-w-6xl text-white">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link to={`/producto/${p.slug}`} className="text-sm underline">
              Ver detalle
            </Link>
            <Link to="/" className="text-sm underline">
              Catálogo
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
            >
              {copied ? "Copiado" : "Copiar texto"}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-full bg-[#D8C3A5] px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
            >
              {downloading ? "Generando…" : "Guardar PNG"}
            </button>
          </div>
        </div>

        {/* Aquí renderiza tu frame de plantilla (usa el que ya tienes o ShareFrame) */}
        <div
          ref={frameRef}
          className={`${frameClass} mx-auto overflow-hidden rounded-[28px] bg-[#F7F3EE]`}
        >
          {/* Si quieres que aquí sea exactamente tu plantilla 4:5, me dices y lo conectamos con ShareFrame */}
          <div className="p-4 text-black">
            <p className="text-xs uppercase tracking-widest text-black/50">
              {p.category} · {p.productType}
            </p>
            <h1 className="mt-1 text-lg font-semibold">{p.name}</h1>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(p.price)}</p>
          </div>
        </div>
      </div>
    </main>
  );
}