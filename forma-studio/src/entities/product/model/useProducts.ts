import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type DocumentData,
} from "firebase/firestore";

import { db } from "../../../firebase";
import { PRODUCTS as LOCAL_PRODUCTS } from "./products";
import type { Product } from "./types";

type Source = "local" | "firestore" | "error";

function isCategory(v: unknown): v is Product["category"] {
  return v === "Hombre" || v === "Mujer" || v === "Accesorios";
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asBoolean(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

type ProductDoc = {
  name?: unknown;
  slug?: unknown;
  category?: unknown;
  productType?: unknown;
  price?: unknown;
  images?: unknown;
  description?: unknown;
  sizes?: unknown;
  badge?: unknown;
  featured?: unknown;
  active?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function normalizeProduct(id: string, data: DocumentData): Product | null {
  const d = data as ProductDoc;

  const name = asString(d.name);
  const slug = asString(d.slug);
  const category = d.category;

  if (!name || !slug || !isCategory(category)) return null;

  const images = asStringArray(d.images);
  const sizes = asStringArray(d.sizes);

  const p: Product = {
    id,
    name,
    slug,
    category,
    productType: asString(d.productType, "Otro"),
    price: asNumber(d.price, 0),
    images: images.length ? images : ["/products/placeholder.jpg"],
    description: asString(d.description, ""),
    sizes: sizes.length ? sizes : ["Único"],
    badge: (typeof d.badge === "string" ? (d.badge as Product["badge"]) : undefined),
    featured: asBoolean(d.featured, false),
    active: d.active === undefined ? true : asBoolean(d.active, true),
    // opcional: si tu tipo Product no tiene esto, puedes borrarlo
    // createdAt: asNumber(d.createdAt, 0),
    // updatedAt: asNumber(d.updatedAt, 0),
  };

  return p;
}

export function useProducts() {
  const [source, setSource] = useState<Source>("local");
  const [firestoreProducts, setFirestoreProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("updatedAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Product[] = [];

        snap.forEach((docSnap) => {
          const p = normalizeProduct(docSnap.id, docSnap.data());
          if (p && p.active !== false) list.push(p);
        });

        if (list.length > 0) {
          setFirestoreProducts(list);
          setSource("firestore");
        } else {
          setFirestoreProducts(null);
          setSource("local");
        }
      },
      () => {
        setFirestoreProducts(null);
        setSource("error");
      }
    );

    return () => unsub();
  }, []);

  const products = useMemo(() => {
    return firestoreProducts && firestoreProducts.length > 0
      ? firestoreProducts
      : LOCAL_PRODUCTS;
  }, [firestoreProducts]);

  return { products, source };
}