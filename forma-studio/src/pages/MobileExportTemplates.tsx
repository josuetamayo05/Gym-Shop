import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import { PRODUCTS } from "../entities/product/model/products";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";
import { ShareFrame } from "../components/ShareFrame";
import { buildWhatsAppLink } from "../utils/whatsapp";

const WHATSAPP = "5350121476";



function waitNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function getBatchProducts(batchIndex: number, batchSize: number) {
  const start = batchIndex * batchSize;
  return PRODUCTS.slice(start, start + batchSize);
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
    backgroundColor: "#000000",
    scale: 3,
    useCORS: true,
  });

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  return blob;
}

function buildPublishText(products: Product[]) {
  const preset =
    "Hola! Vengo de Facebook. Me interesa un producto del catálogo. Producto: ";
  const waLink = WHATSAPP ? buildWhatsAppLink(WHATSAPP, preset) : "";

  const lines: string[] = [];
  lines.push("GYM STUDIO");
  lines.push("");
  lines.push("Productos:");

  for (const p of products) {
    lines.push(`• ${p.name} — ${formatMoney(p.price)}`);
  }

  lines.push("");
  lines.push("Pedir por WhatsApp:");
  lines.push(waLink || "WhatsApp no configurado");
  lines.push("");
  lines.push("Escribe el nombre del producto y tu talla.");

  return lines.join("\n");
}



export function MobileExportTemplates() {
  type Mode = "publico" | "gestores";
  const [mode, setMode] = useState<Mode>("publico");
  //const showPriceInImage = mode === "publico";

  const [batchSize, setBatchSize] = useState(10);
  const [batchIndex, setBatchIndex] = useState(0);

  const [copiedWhich, setCopiedWhich] = useState<"batch" | "all" | null>(null);
  function markCopied(which: "batch" | "all") {
    setCopiedWhich(which);
    window.setTimeout(() => setCopiedWhich(null), 1200);
  }

  const [autoMode, setAutoMode] = useState(false);

  // Renderizamos 1 producto offscreen
  const [renderIndex, setRenderIndex] = useState(0);
  const currentRenderProduct = useMemo(
    () => PRODUCTS[renderIndex],
    [renderIndex]
  );

  const frameRef = useRef<HTMLDivElement | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const totalBatches = useMemo(
    () => Math.max(1, Math.ceil(PRODUCTS.length / batchSize)),
    [batchSize]
  );

  const batchProducts = useMemo(
    () => getBatchProducts(batchIndex, batchSize),
    [batchIndex, batchSize]
  );

  const showPriceInImage = mode === "publico";

  // Genera imágenes para una lista específica (evita desincronización)
  async function generateForList(list: Product[]) {
    const out: File[] = [];

    for (const p of list) {
      const idx = PRODUCTS.findIndex((x) => x.id === p.id);
      if (idx === -1) continue;

      setRenderIndex(idx);

      await waitNextPaint();
      await waitNextPaint();

      if (!frameRef.current) continue;

      const blob = await captureNodePng(frameRef.current);
      if (!blob) continue;

      out.push(new File([blob], `${p.slug}-${mode}.png`, { type: "image/png" }));
    }

    return out;
  }

  async function generateCurrentBatch() {
    setError("");
    setFiles([]);
    setPreparing(true);

    await waitNextPaint();
    await waitNextPaint();

    try {
      const out = await generateForList(batchProducts);
      setFiles(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando plantillas");
    } finally {
      setPreparing(false);
    }
  }

  async function shareBatchAndMaybeNext() {
    setError("");

    const nav = navigator as Navigator & {
      share?: (data: {
        files?: File[];
        title?: string;
        text?: string;
      }) => Promise<void>;
      canShare?: (data: { files?: File[] }) => boolean;
    };

    if (!files.length) {
      setError("Primero genera el lote.");
      return;
    }

    if (!nav.share || !nav.canShare) {
      setError(
        "Tu navegador no soporta compartir múltiples archivos. Usa Safari actualizado."
      );
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
        text:
          mode === "publico"
            ? `Lote ${batchIndex + 1}/${totalBatches} — Público (con precio)`
            : `Lote ${batchIndex + 1}/${totalBatches} — Gestores (sin precio)`,
      });

      // Auto: preparar siguiente lote
      if (autoMode && batchIndex < totalBatches - 1) {
        const nextIndex = batchIndex + 1;
        const nextList = getBatchProducts(nextIndex, batchSize);

        setBatchIndex(nextIndex);
        setFiles([]);

        setPreparing(true);
        const nextFiles = await generateForList(nextList);
        setFiles(nextFiles);
        setPreparing(false);
      }
    } catch {
      // cancelado
    }
  }

  async function copyBatchText() {
    const text = buildPublishText(batchProducts);
    try {
      await navigator.clipboard.writeText(text);
      markCopied("batch");
    } catch {
      prompt("Copia este texto:", text);
    }
  }

  async function copyAllText() {
    const text = buildPublishText(PRODUCTS);
    try {
      await navigator.clipboard.writeText(text);
      markCopied("all");
    } catch {
      prompt("Copia este texto:", text);
    }
  }

  async function startAutoExport() {
    setAutoMode(true);
    setBatchIndex(0);
    setFiles([]);
    await waitNextPaint();
    await generateCurrentBatch();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">Exportar plantillas (iPhone)</h1>

      {/* Sección Público / Gestores */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setMode("publico");
            setFiles([]);
            setAutoMode(false);
          }}
          className={
            "rounded-2xl border px-4 py-2 text-sm font-semibold " +
            (mode === "publico"
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white hover:bg-black/5")
          }
        >
          Público (con precio)
        </button>

        <button
          onClick={() => {
            setMode("gestores");
            setFiles([]);
            setAutoMode(false);
          }}
          className={
            "rounded-2xl border px-4 py-2 text-sm font-semibold " +
            (mode === "gestores"
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white hover:bg-black/5")
          }
        >
          Gestores (sin precio)
        </button>

        <label className="ml-auto inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={(e) => setAutoMode(e.target.checked)}
          />
          Auto
        </label>
      </div>

      <section className="mt-5 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">
            Lote:&nbsp;
            <select
              value={batchSize}
              onChange={(e) => {
                setBatchSize(Number(e.target.value));
                setBatchIndex(0);
                setFiles([]);
                setAutoMode(false);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10 (recomendado)</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setBatchIndex((x) => Math.max(0, x - 1));
                setFiles([]);
                setAutoMode(false);
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
                setAutoMode(false);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateCurrentBatch}
            disabled={preparing}
            className="rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {preparing ? "Generando…" : "Generar lote"}
          </button>

          <button
            onClick={shareBatchAndMaybeNext}
            disabled={!files.length || preparing}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {autoMode
              ? `Guardar/Compartir y siguiente (${files.length})`
              : `Guardar/Compartir (${files.length})`}
          </button>

          <button
            onClick={copyBatchText}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            {copiedWhich === "batch" ? "Copiado" : "Copiar texto (este lote)"}
          </button>

          <button
            onClick={copyAllText}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            {copiedWhich === "all" ? "Copiado" : "Copiar texto (todo)"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={startAutoExport}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Iniciar exportación completa (modo automático)
          </button>

          <span className="text-xs text-black/50">
            Luego solo toca “Guardar/Compartir y siguiente”.
          </span>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      </section>

      {/* Render fuera de pantalla */}
      <div className="fixed left-[-10000px] top-0">
        <div ref={frameRef}>
          {currentRenderProduct && (
            <ShareFrame
              key={`${currentRenderProduct?.id}-${mode}`}  // fuerza re-render al cambiar modo
              product={currentRenderProduct}
              format="photo"
              whatsapp={WHATSAPP}
              shape="square"
              showPrice={showPriceInImage}                // público true / gestores false
            />
          )}
        </div>
      </div>
    </main>
  );
}