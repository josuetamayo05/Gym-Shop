import { useEffect, useMemo, useState } from "react";
import { PRODUCTS as LOCAL_PRODUCTS } from "./products";
import type { Product } from "./types";

type Source = "local" | "remote" | "loading" | "error";

export function useProducts() {
  const [source, setSource] = useState<Source>("loading");
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`);

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = (await res.json()) as Product[];

        if (!cancelled) {
          if (data.length > 0) {
            setRemoteProducts(data);
            setSource("remote");
          } else {
            setRemoteProducts(null);
            setSource("local");
          }
        }
      } catch (error) {
        console.error("Error cargando /api/products:", error);
        if (!cancelled) {
          setRemoteProducts(null);
          setSource("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo(() => {
    if (source === "remote" && remoteProducts) return remoteProducts;
    if (source === "local" || source === "error") return LOCAL_PRODUCTS;
    return [];
  }, [remoteProducts, source]);

  return { products, source };
}