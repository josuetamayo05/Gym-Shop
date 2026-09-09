import { useEffect, useState } from "react";
import { PRODUCTS as LOCAL_PRODUCTS } from "./products";
import type { Product } from "./types";

type Status = "loading" | "ok" | "not-found" | "error";

export function useProduct(rawSlug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Decodificar el slug por si trae caracteres especiales o espacios
  const slug = decodeURIComponent(rawSlug || "").trim();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setStatus("not-found");
        return;
      }

      try {
        // 1. Intentar cargar desde el endpoint individual
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}?t=${Date.now()}`);

        if (res.ok) {
          const data = (await res.json()) as Product;
          if (data && data.name && !cancelled) {
            setProduct(data);
            setStatus("ok");
            return;
          }
        }

        // 2. Si falla o da 404, buscar en la lista completa /api/products (que sabemos que funciona 100%)
        const listRes = await fetch(`/api/products?t=${Date.now()}`);
        if (listRes.ok) {
          const list = (await listRes.json()) as Product[];
          const found = list.find((p) => p.slug === slug || p.id === slug);

          if (found && !cancelled) {
            setProduct(found);
            setStatus("ok");
            return;
          }
        }

        // 3. Fallback a productos locales
        const local = LOCAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
        if (!cancelled) {
          if (local) {
            setProduct(local);
            setStatus("ok");
          } else {
            setStatus("not-found");
          }
        }
      } catch (error) {
        console.error(`Error buscando producto [${slug}]:`, error);

        // Fallback en caso de error de red
        const local = LOCAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
        if (!cancelled) {
          if (local) {
            setProduct(local);
            setStatus("ok");
          } else {
            setStatus("error");
          }
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, status };
}