import { useEffect, useState } from "react";
import { PRODUCTS as LOCAL_PRODUCTS } from "./products";
import type { Product } from "./types";

type Status = "loading" | "ok" | "not-found" | "error";

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}?t=${Date.now()}`);

        if (res.status === 404) {
          const local = LOCAL_PRODUCTS.find((p) => p.slug === slug);

          if (!cancelled) {
            if (local) {
              setProduct(local);
              setStatus("ok");
            } else {
              setStatus("not-found");
            }
          }
          return;
        }

        if (!res.ok) throw new Error("API error");

        const data = (await res.json()) as Product;

        if (!cancelled) {
          setProduct(data);
          setStatus("ok");
        }
      } catch (error) {
        console.error(`Error cargando /api/products/${slug}:`, error);

        const local = LOCAL_PRODUCTS.find((p) => p.slug === slug);

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

    if (!slug) {
      setProduct(null);
      setStatus("not-found");
      return;
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, status };
}