import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

import type { Product } from "../types";
import { ShareFrame } from "./ShareFrame";

const WHATSAPP = (import.meta.env.VITE_WHATSAPP_PHONE as string | undefined) ?? "";

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

export function DownloadStoryButton({ product }: { product: Product }) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!frameRef.current) return;
    setLoading(true);

    try {
      await waitForImages(frameRef.current);

      const canvas = await html2canvas(frameRef.current, {
        backgroundColor: "#F7F3EE",
        scale: 3, // alta calidad (360x640 -> 1080x1920)
        useCORS: true,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File([blob], `${product.slug}-plantilla.png`, { type: "image/png" });

      // iPhone/Android: abrir Share Sheet (Guardar imagen / Archivos / WhatsApp)
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

      // Desktop fallback: descarga normal
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.slug}-story.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-60"
        title="Guardar plantilla Story"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">
          {loading ? "Generando…" : "Story"}
        </span>
      </button>

      {/* Render fuera de pantalla (NO opacity-0 para evitar PNG negro en iOS) */}
      <div className="fixed left-[-10000px] top-0">
        <div ref={frameRef}>
          <ShareFrame product={product} format="photo" whatsapp={WHATSAPP} shape="square" />
        </div>
      </div>
    </>
  );
}