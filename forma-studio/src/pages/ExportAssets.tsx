import { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

import { PRODUCTS } from "../entities/product/model/products";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";
import { ShareFrame } from "../components/ShareFrame";

type Format = "post" | "story";
const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

function basename(path: string) {
  const clean = path.split("?")[0];
  return clean.substring(clean.lastIndexOf("/") + 1) || "image.jpg";
}

function buildSimpleFacebookText(p: Product) {
  const sizes = p.sizes?.length ? p.sizes.join(", ") : "Consultar";
  return [
    `GYM STUDIO`,
    `${p.category} · ${p.productType}`,
    `${p.name}`,
    `Precio: ${formatMoney(p.price)}`,
    `Tallas: ${sizes}`,
    `WhatsApp: +${WHATSAPP}`,
  ].join("\n");
}

async function fetchAsBlob(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  return await res.blob();
}

export function ExportAssets() {
  const [format, setFormat] = useState<Format>("post");
  const [includeOriginalPhotos, setIncludeOriginalPhotos] = useState(true);
  const [includeMessages, setIncludeMessages] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: PRODUCTS.length });

  const frameRef = useRef<HTMLDivElement | null>(null);

  // Para exportar uno por uno, renderizamos "el producto actual" oculto
  const [index, setIndex] = useState(0);
  const currentProduct = useMemo(() => PRODUCTS[index], [index]);

  async function exportAll() {
    if (!frameRef.current) return;

    setRunning(true);
    setProgress({ current: 0, total: PRODUCTS.length });

    const zip = new JSZip();
    const messages: string[] = [];

    try {
      for (let i = 0; i < PRODUCTS.length; i++) {
        setIndex(i);
        setProgress({ current: i + 1, total: PRODUCTS.length });

        // Espera a que React pinte el siguiente producto
        await wait(50);

        const node = frameRef.current;
        if (!node) continue;

        // Espera a que todas las imágenes del frame estén cargadas
        await waitForImages(node);

        // Captura a PNG (html2canvas -> no negro en iOS)
        const canvas = await html2canvas(node, {
          backgroundColor: "#F7F3EE",
          scale: 3,
          useCORS: true,
        });

        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        if (blob) {
          const p = PRODUCTS[i];
          zip.file(`share/${format}/${p.slug}.png`, blob);
        }

        // Textos sencillos para Facebook
        if (includeMessages) {
          const p = PRODUCTS[i];
          messages.push(buildSimpleFacebookText(p));
          messages.push("\n----------------------\n");
        }

        // Fotos originales del producto (las URLs de images[])
        if (includeOriginalPhotos) {
          const p = PRODUCTS[i];
          for (const imgPath of p.images ?? []) {
            try {
              const url = new URL(imgPath, window.location.origin).toString();
              const b = await fetchAsBlob(url);
              zip.file(`originals/${p.slug}/${basename(imgPath)}`, b);
            } catch {
              // si falla alguna foto, no frenamos todo
            }
          }
        }
      }

      if (includeMessages) {
        zip.file("facebook-messages.txt", messages.join("\n"));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `gym-studio-export-${format}.zip`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-xl font-semibold">Exportar productos (Facebook)</h1>
      <p className="mt-2 text-sm text-black/60">
        Genera un ZIP con imágenes tipo plantilla (Post/Story), textos y (opcional) fotos originales.
        Recomendado hacerlo en PC/Mac.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">
          Formato:&nbsp;
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm"
          >
            <option value="post">Post (4:5)</option>
            <option value="story">Story (9:16)</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={includeOriginalPhotos}
            onChange={(e) => setIncludeOriginalPhotos(e.target.checked)}
          />
          Incluir fotos originales
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={includeMessages}
            onChange={(e) => setIncludeMessages(e.target.checked)}
          />
          Incluir mensajes (txt)
        </label>

        <button
          disabled={running}
          onClick={exportAll}
          className="ml-auto rounded-2xl bg-[#0B0B0C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {running ? `Exportando… (${progress.current}/${progress.total})` : "Exportar todo (ZIP)"}
        </button>
      </div>

      {/* Render oculto para capturar */}
      <div className="pointer-events-none mt-6 opacity-0">
        <div ref={frameRef}>
          {currentProduct && (
            <ShareFrame product={currentProduct} format={format} whatsapp={WHATSAPP} />
          )}
        </div>
      </div>
    </main>
  );
}