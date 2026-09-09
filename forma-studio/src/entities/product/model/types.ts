export type Category =
  | "Hombre"
  | "Mujer"
  | "Tecnología"
  | "Electrodomésticos"
  | "Hogar"
  | "Calzado"
  | "Suplementos"
  | "Accesorios"
  | "Tendencias";

export type ProductType =
  | "Camisetas"
  | "Pantalones"
  | "Licras"
  | "Calzado"
  | "Audio & Tech"
  | "Gadgets"
  | "Electrodomésticos"
  | "Hogar & Cocina"
  | "Suplementos"
  | "Accesorios"
  | "Otro";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  productType: string;
  price: number;
  images: string[];
  description?: string;
  sizes?: string[];
  badge?: "Nuevo" | "Best seller" | "Destacado" | "-15%";
  featured?: boolean;
  soldOut?: boolean;
  active?: boolean;
};