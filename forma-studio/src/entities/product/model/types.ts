export type Category = "Accesorios" | "Hombre" | "Mujer";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  images: string[];
  description?: string;
  sizes: string[];
  badge?: "Nuevo" | "Best seller" | "-15%";
  featured?: boolean;
};