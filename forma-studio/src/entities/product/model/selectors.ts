import { PRODUCTS } from "./products";

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(PRODUCTS.map((p) => p.category)));
}