export type Category = "Hombre" | "Mujer" | "Accesorios";

export type ProductType = "Pulover" | "Short" | "Licra" | "Tops" | "Accesorios" | "Suplementos" | "Otro";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Hombre" | "Mujer" | "Accesorios";
  productType: string;
  price: number;
  images: string[];
  description?: string;
  sizes: string[];
  badge?: "Nuevo" | "Best seller" | "-15%";
  featured?: boolean;

  active?: boolean; // <- para ocultar productos desde admin
};