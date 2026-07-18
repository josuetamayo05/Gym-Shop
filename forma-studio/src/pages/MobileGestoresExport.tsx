import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import { PRODUCTS } from "../entities/product/model/products";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";
import { ShareFrame } from "../components/ShareFrame";

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
    scale: 3, // 360px -> 1080px
    useCORS: true,
  });

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  return blob;
}

function buildCaption(products: Product[], batchLabel: string) {
  const lines: string[] = [];
  lines.push(`GYM STUDIO — Material para gestores`);
  lines.push(batchLabel);
  lines.push(`(Fotos SIN precio. Edita el texto y añade tu margen)`);
  lines.push("");

  for (const p of products) {
    lines.push(`• ${p.name} — Base: ${formatMoney(p.price)}`);
  }

  lines.push("");
  lines.push("Margen sugerido: +15% a +30% (según tu mercado).");
  return lines.join("\n");
}

export function MobileGestoresExport() {
  const [batchSize, setBatchSize] = useState(10);
  const [batchIndex, setBatchIndex] = useState(0);

  const totalBatches = useMemo(
    () => Math.max(1, Math.ceil(PRODUCTS.length / batchSize)),
    [batchSize]
  );

  const batchProducts = useMemo(() => {
    const start = batchIndex * batchSize;
    return PRODUCTS.slice(start, start + batchSize);
  }, [batchIndex, batchSize]);

  // Render offscreen (1 producto a la vez)
  const [renderIndex, setRenderIndex] = useState(0);
  const currentRenderProduct = useMemo(() => PRODUCTS[renderIndex], [renderIndex]);

  const frameRef = useRef<HTMLDivElement | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  function markCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function generateBatch() {
    setError("");
    setFiles([]);
    setPreparing(true);

    try {
      const out: File[] = [];

      for (const p of batchProducts) {
        const idx = PRODUCTS.findIndex((x) => x.id === p.id);
        setRenderIndex(idx);

        await waitNextPaint();
        await waitNextPaint();

        if (!frameRef.current) continue;

        const blob = await captureNodePng(frameRef.current);
        if (!blob) continue;

        out.push(new File([blob], `${p.slug}-gestor.png`, { type: "image/png" }));
      }

      setFiles(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando imágenes");
    } finally {
      setPreparing(false);
    }
  }

  async function shareToWhatsApp() {
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

    const caption = buildCaption(batchProducts, `Lote ${batchIndex + 1}/${totalBatches}`);

    try {
      await nav.share({
        files,
        title: "GYM STUDIO — Gestores",
        text: caption,
      });
      // En WhatsApp eliges el grupo de gestores y envías.
      // Nota: WhatsApp usará un caption general para el lote.
    } catch {
      // cancelado
    }
  }

  async function copyCaption() {
    const caption = buildCaption(batchProducts, `Lote ${batchIndex + 1}/${totalBatches}`);
    try {
      await navigator.clipboard.writeText(caption);
      markCopied();
    } catch {
      prompt("Copia este texto:", caption);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">Gestores — Exportar fotos SIN precio</h1>
      <p className="mt-2 text-sm text-black/60">
        Genera 1 plantilla por producto (sin precio en la imagen) y compártelas en WhatsApp con un texto
        que incluye nombre + precio base.
      </p>

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
            onClick={generateBatch}
            disabled={preparing}
            className="rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {preparing ? "Generando…" : "Generar imágenes"}
          </button>

          <button
            onClick={shareToWhatsApp}
            disabled={!files.length}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Compartir en WhatsApp ({files.length})
          </button>

          <button
            onClick={copyCaption}
            className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            {copied ? "Copiado" : "Copiar texto (nombre + base)"}
          </button>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <p className="text-xs text-black/50">
          En iPhone: al compartir, elige WhatsApp → selecciona el grupo de gestores → enviar.
          Si falla, baja el lote a 5.
        </p>
      </section>

      {/* Render fuera de pantalla para capturar (sin bordes redondos) */}
      <div className="fixed left-[-10000px] top-0">
        <div ref={frameRef}>
          {currentRenderProduct && (
            <ShareFrame
              product={currentRenderProduct}
              format="photo"
              shape="square"
              showPrice={false}
            />
          )}
        </div>
      </div>
    </main>
  );
}