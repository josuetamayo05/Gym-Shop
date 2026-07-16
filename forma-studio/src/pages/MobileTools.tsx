import { useMemo, useState } from "react";
import { PRODUCTS } from "../entities/product/model/products";
import type { Product } from "../entities/product/model/types";
import { formatMoney } from "../utils/money";

const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";

type Prepared = { files: File[]; label: string };

function absUrl(path: string) {
  return new URL(path, window.location.origin).toString();
}

function basename(path: string) {
  const clean = path.split("?")[0];
  return clean.substring(clean.lastIndexOf("/") + 1) || "image.jpg";
}

async function fetchAsFile(url: string, filename: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

function buildFacebookList(products: Product[]) {
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

export function MobileTools() {
  const [batchSize, setBatchSize] = useState(20);
  const [batchIndex, setBatchIndex] = useState(0);

  const [preparing, setPreparing] = useState(false);
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [error, setError] = useState<string>("");

  // Todas las fotos del catálogo (todas las images[] de cada producto)
  const allPhotos = useMemo(() => {
    const list: { url: string; filename: string }[] = [];

    for (const p of PRODUCTS) {
      for (const imgPath of p.images ?? []) {
        // nombre de archivo amigable: slug + nombre original
        const file = `${p.slug}__${basename(imgPath)}`;
        list.push({ url: absUrl(imgPath), filename: file });
      }
    }

    return list;
  }, []);

  const totalBatches = useMemo(() => {
    return Math.max(1, Math.ceil(allPhotos.length / batchSize));
  }, [allPhotos.length, batchSize]);

  const currentSlice = useMemo(() => {
    const start = batchIndex * batchSize;
    return allPhotos.slice(start, start + batchSize);
  }, [allPhotos, batchIndex, batchSize]);

  async function prepareBatch() {
    setError("");
    setPrepared(null);
    setPreparing(true);

    try {
      const files: File[] = [];
      for (const item of currentSlice) {
        const f = await fetchAsFile(item.url, item.filename);
        files.push(f);
      }

      setPrepared({
        files,
        label: `Lote ${batchIndex + 1}/${totalBatches} (${files.length} fotos)`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error preparando fotos");
    } finally {
      setPreparing(false);
    }
  }

  async function sharePrepared() {
    if (!prepared) return;

    const nav = navigator as Navigator & {
      share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      canShare?: (data: { files?: File[] }) => boolean;
    };

    if (!nav.share || !nav.canShare) {
      setError("Tu navegador no soporta compartir archivos múltiples.");
      return;
    }

    if (!nav.canShare({ files: prepared.files })) {
      setError("iPhone no permite compartir este lote (puede ser muy grande). Baja el tamaño del lote.");
      return;
    }

    try {
      await nav.share({
        files: prepared.files,
        title: "GYM STUDIO - Fotos",
        text: prepared.label,
      });
    } catch {
      // si el usuario cancela, no hacemos nada
    }
  }

  async function copyFacebookText() {
    setError("");
    const text = buildFacebookList(PRODUCTS);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      prompt("Copia este texto:", text);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">Herramientas móvil (Facebook)</h1>
      <p className="mt-2 text-sm text-black/60">
        En iPhone no se puede guardar todo “automático” sin interacción. La opción pro es
        preparar un lote y abrir el Share Sheet para “Guardar imágenes”.
      </p>

      <div className="mt-5 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyFacebookText}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Copiar lista (nombre + precio)
          </button>

          <span className="text-xs text-black/60">
            Total fotos en catálogo: <b>{allPhotos.length}</b>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">
            Tamaño de lote:&nbsp;
            <select
              value={batchSize}
              onChange={(e) => {
                setBatchSize(Number(e.target.value));
                setBatchIndex(0);
                setPrepared(null);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20 (recomendado)</option>
              <option value={30}>30</option>
            </select>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setBatchIndex((x) => Math.max(0, x - 1));
                setPrepared(null);
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
                setPrepared(null);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            disabled={preparing}
            onClick={prepareBatch}
            className="rounded-2xl bg-[#D8C3A5] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {preparing ? "Preparando…" : "Preparar lote"}
          </button>

          <button
            disabled={!prepared}
            onClick={sharePrepared}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Guardar/Compartir lote
          </button>

          {prepared && (
            <span className="self-center text-xs text-black/60">{prepared.label}</span>
          )}
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-600">{error}</p>
        )}

        <p className="text-xs text-black/50">
          Tip iPhone: en el menú que sale, elige <b>Guardar imágenes</b> o <b>Guardar en Archivos</b>.
          Si te da error, baja el tamaño de lote a 10.
        </p>
      </div>
    </main>
  );
}
