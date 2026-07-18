import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import { PRODUCTS } from "../entities/product/model/products";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";
import { ShareFrame } from "../components/ShareFrame";

type Mode = "publico" | "gestores";

function waitNextPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
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
    scale: 3, // 360px => 1080px
    useCORS: true,
  });

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  return blob;
}

function getBatchProducts(batchIndex: number, batchSize: number) {
  const start = batchIndex * batchSize;
  return PRODUCTS.slice(start, start + batchSize);
}

// Caption (info) igual en ambos modos: nombre + precio base
function buildCaption(products: Product[], label: string) {
  const lines: string[] = [];
  lines.push(`GYM STUDIO — ${label}`);
  lines.push("");
  for (const p of products) {
    lines.push(`• ${p.name} — Base: ${formatMoney(p.price)}`);
  }
  lines.push("");
  lines.push("Edita el texto y añade tu margen si eres gestor/a.");
  return lines.join("\n");
}

export function MobileExportTemplates() {
  const [mode, setMode] = useState<Mode>("publico");
  const [batchSize, setBatchSize] = useState(10);
  const [batchIndex, setBatchIndex] = useState(0);
  const [autoMode, setAutoMode] = useState(false);

  // Renderizamos 1 producto offscreen para capturar imagen por imagen
  const [renderIndex, setRenderIndex] = useState(0);
  const currentRenderProduct = useMemo(() => PRODUCTS[renderIndex], [renderIndex]);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  // UI Copiado (botón)
  const [copied, setCopied] = useState(false);
  function markCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  const totalBatches = useMemo(
    () => Math.max(1, Math.ceil(PRODUCTS.length / batchSize)),
    [batchSize]
  );

  const batchProducts = useMemo(
    () => getBatchProducts(batchIndex, batchSize),
    [batchIndex, batchSize]
  );

  const showPriceInImage = mode === "publico"; // gestores => false

  async function generateForProducts(list: Product[]) {
    if (!frameRef.current) return [];

    const out: File[] = [];

    for (const p of list) {
      const idx = PRODUCTS.findIndex((x) => x.id === p.id);
      setRenderIndex(idx);

      // Espera render estable
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

    try {
      const out = await generateForProducts(batchProducts);
      setFiles(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando imágenes");
    } finally {
      setPreparing(false);
    }
  }

  async function shareBatchAndMaybeNext() {
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

    const labelMode =
      mode === "gestores" ? "Gestores (sin precio en imagen)" : "Público (con precio en imagen)";
    const caption = buildCaption(
      batchProducts,
      `Lote ${batchIndex + 1}/${totalBatches} — ${labelMode}`
    );

    try {
      await nav.share({
        files,
        title: "GYM STUDIO",
        text: caption,
      });

      // Si autoMode: preparar siguiente lote automáticamente
      if (autoMode && batchIndex < totalBatches - 1) {
        const nextBatchIndex = batchIndex + 1;
        const nextProducts = getBatchProducts(nextBatchIndex, batchSize);

        setBatchIndex(nextBatchIndex);
        setFiles([]);
        setPreparing(true);

        const nextFiles = await generateForProducts(nextProducts);
        setFiles(nextFiles);
        setPreparing(false);
      }
    } catch {
      // cancelado
    } finally {
      setPreparing(false);
    }
  }

  async function copyCaption() {
    const labelMode =
      mode === "gestores" ? "Gestores (sin precio en imagen)" : "Público (con precio en imagen)";
    const caption = buildCaption(
      batchProducts,
      `Lote ${batchIndex + 1}/${totalBatches} — ${labelMode}`
    );

    try {
      await navigator.clipboard.writeText(caption);
      markCopied();
    } catch {
      prompt("Copia este texto:", caption);
    }
  }

  async function startAuto() {
    setAutoMode(true);
    setBatchIndex(0);
    setFiles([]);
    await waitNextPaint();
    await generateCurrentBatch();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">Mobile Export</h1>
      <p className="mt-2 text-sm text-black/60">
        Genera 1 plantilla por producto (4:5). En Gestores se exporta sin precio en la imagen.
      </p>

      {/* Selector modo */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setMode("publico");
            setFiles([]);
          }}
          className={
            "rounded-2xl border px-4 py-2 text-sm font-semibold " +
            (mode === "publico"
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white hover:bg-black/5")
          }
        >
          Público
        </button>

        <button
          onClick={() => {
            setMode("gestores");
            setFiles([]);
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

      <section className="mt-4 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
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
              <option value={10}>10 (recomendado)</option>
              <option value={15}>15</option>
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
            onClick={generateCurrentBatch}
            disabled={preparing}
            className="rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {preparing ? "Generando…" : "Generar imágenes"}
          </button>

          <button
            onClick={shareBatchAndMaybeNext}
            disabled={!files.length || preparing}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {autoMode ? `Compartir y siguiente (${files.length})` : `Compartir en WhatsApp (${files.length})`}
          </button>

          <button
            onClick={copyCaption}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            {copied ? "Copiado" : "Copiar texto (nombre + base)"}
          </button>

          <button
            onClick={startAuto}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Iniciar auto (desde lote 1)
          </button>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <p className="text-xs text-black/50">
          iPhone: Compartir → WhatsApp → elige grupo/canal → enviar. Si falla, baja el lote a 5.
        </p>
      </section>

      {/* Render fuera de pantalla para capturar (NO opacity-0 para evitar capturas negras en iOS) */}
      <div className="fixed left-[-10000px] top-0">
        <div ref={frameRef}>
          {currentRenderProduct && (
            <ShareFrame
              product={currentRenderProduct}
              format="photo"
              shape="square"
              showPrice={showPriceInImage}
            />
          )}
        </div>
      </div>
    </main>
  );
}