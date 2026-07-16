import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import { PRODUCTS } from "../entities/product/model/products";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";
import { ShareFrame } from "../components/ShareFrame";

const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";
type Format = "shein" | "post" | "story";

function waitNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function buildSimpleText(products: Product[]) {
  const lines: string[] = [];
  lines.push("GYM STUDIO");
  lines.push(`WhatsApp: +${WHATSAPP}`);
  lines.push("");
  lines.push("Productos:");

  for (const p of products) {
    lines.push(`• ${p.name} — ${formatMoney(p.price)}`);
  }

  lines.push("");
  lines.push("Disponibilidad por WhatsApp. Respuesta rápida.");
  return lines.join("\n");
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

async function captureNodePng(node: HTMLElement) {
  await waitForImages(node);

  const canvas = await html2canvas(node, {
    backgroundColor: "#F7F3EE",
    scale: 3,
    useCORS: true,
  });

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  return blob;
}

export function MobileCollages() {
  const [format, setFormat] = useState<Format>("shein");
  const [batchSize, setBatchSize] = useState(10);
  const [batchIndex, setBatchIndex] = useState(0);

  // para renderizar 1 producto offscreen e ir capturando
  const [renderIndex, setRenderIndex] = useState(0);
  const currentProduct = useMemo(() => PRODUCTS[renderIndex], [renderIndex]);

  const frameRef = useRef<HTMLDivElement | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const totalBatches = useMemo(
    () => Math.max(1, Math.ceil(PRODUCTS.length / batchSize)),
    [batchSize]
  );

  const batchProducts = useMemo(() => {
    const start = batchIndex * batchSize;
    return PRODUCTS.slice(start, start + batchSize);
  }, [batchIndex, batchSize]);

  async function generateBatch() {
    setError("");
    setFiles([]);
    setPreparing(true);

    try {
      const out: File[] = [];

      for (const p of batchProducts) {
        const idx = PRODUCTS.findIndex((x) => x.id === p.id);
        setRenderIndex(idx);

        // espera render
        await waitNextPaint();
        await waitNextPaint();

        if (!frameRef.current) continue;

        const blob = await captureNodePng(frameRef.current);
        if (!blob) continue;

        // 1 ARCHIVO POR PRODUCTO (esto es lo que quieres)
        out.push(new File([blob], `${p.slug}-${format}.png`, { type: "image/png" }));
      }

      setFiles(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando plantillas");
    } finally {
      setPreparing(false);
    }
  }

  async function shareBatch() {
    setError("");

    const nav = navigator as Navigator & {
      share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      canShare?: (data: { files?: File[] }) => boolean;
    };

    if (!files.length) {
      setError("Primero genera el lote.");
      return;
    }

    if (!nav.share || !nav.canShare) {
      setError("Tu navegador no soporta compartir múltiples archivos. Usa Safari actualizado.");
      return;
    }

    if (!nav.canShare({ files })) {
      setError("El lote es demasiado grande para iPhone. Baja a 5–10.");
      return;
    }

    try {
      await nav.share({
        files,
        title: "GYM STUDIO - Plantillas",
        text: `Lote ${batchIndex + 1}/${totalBatches}`,
      });
      // El usuario elige “Guardar imágenes”
    } catch {
      // usuario canceló
    }
  }

  async function copyBatchText() {
    const text = buildSimpleText(batchProducts);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      prompt("Copia este texto:", text);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">Plantillas (iPhone)</h1>
      <p className="mt-2 text-sm text-black/60">
        Genera <b>1 plantilla por producto</b> y guarda varias a la vez desde iOS.
        Recomendado: <b>SHEIN (3:4)</b> y lotes de <b>10</b>.
      </p>

      <section className="mt-5 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">
            Formato:&nbsp;
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value as Format);
                setFiles([]);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm"
            >
              <option value="shein">SHEIN (3:4)</option>
              <option value="post">Post (4:5)</option>
              <option value="story">Story (9:16)</option>
            </select>
          </label>

          <label className="text-sm font-semibold">
            Lote:&nbsp;
            <select
              value={batchSize}
              onChange={(e) => {
                setBatchSize(Number(e.target.value));
                setBatchIndex(0);
                setFiles([]);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setBatchIndex((x) => Math.max(0, x - 1));
                setFiles([]);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
            >
              ←
            </button>
            <span className="text-sm font-semibold">
              Lote {batchIndex + 1}/{totalBatches}
            </span>
            <button
              onClick={() => {
                setBatchIndex((x) => Math.min(totalBatches - 1, x + 1));
                setFiles([]);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateBatch}
            disabled={preparing}
            className="rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {preparing ? "Generando…" : "Generar plantillas"}
          </button>

          <button
            onClick={shareBatch}
            disabled={!files.length}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Guardar/Compartir ({files.length})
          </button>

          <button
            onClick={copyBatchText}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Copiar texto (este lote)
          </button>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <p className="text-xs text-black/50">
          iPhone: al tocar “Guardar/Compartir”, elige <b>Guardar imágenes</b>.
          Si da error, baja el lote a 5–10.
        </p>
      </section>

      {/* Render fuera de pantalla (NO opacity:0 para evitar capturas negras) */}
      <div className="fixed left-[-10000px] top-0">
        <div ref={frameRef}>
          {currentProduct && (
            <ShareFrame product={currentProduct} format={format} whatsapp={WHATSAPP} />
          )}
        </div>
      </div>
    </main>
  );
}