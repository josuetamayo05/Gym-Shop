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
        // 👇 Añade timestamp para evitar caché
        const res = await fetch(`/api/products?t=${Date.now()}`);

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = (await res.json()) as Product[];

        // 👇 Debug temporal
        console.log("API devolvió:", data.length, "productos");
        console.log("Primer producto:", data[0]?.name);
        console.log("Último producto:", data[data.length - 1]?.name);

        if (!cancelled) {
          if (data.length > 0) {
            setRemoteProducts(data);
            setSource("remote");
          } else {
            console.log("API devolvió 0 productos, usando local");
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
    if (remoteProducts && remoteProducts.length > 0) {
      return remoteProducts;
    }
    return LOCAL_PRODUCTS;
  }, [remoteProducts]);

  // 👇 Debug temporal
  console.log("useProducts → source:", source, "total:", products.length);

  return { products, source };
}