import { useEffect, useMemo, useState } from "react";
import { PRODUCTS as LOCAL_PRODUCTS } from "./products";
import type { Product } from "./types";

type Source = "local" | "remote" | "error";

export function useProducts() {
  const [source, setSource] = useState<Source>("local");
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list = data as Product[];
        if (list.length > 0) {
          setRemoteProducts(list);
          setSource("remote");
        } else {
          setSource("local");
        }
      })
      .catch(() => {
        setSource("error");
      });
  }, []);

  const products = useMemo(() => {
    return remoteProducts && remoteProducts.length > 0
      ? remoteProducts
      : LOCAL_PRODUCTS;
  }, [remoteProducts]);

  return { products, source };
}