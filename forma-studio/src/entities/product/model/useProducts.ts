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
        const res = await fetch("/api/products");

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        const list = data as Product[];

        if (!cancelled) {
          if (list.length > 0) {
            setRemoteProducts(list);
            setSource("remote");
          } else {
            setSource("local");
          }
        }
      } catch {
        if (!cancelled) {
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

  return { products, source };
}