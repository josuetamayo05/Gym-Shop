export type Category = "Hombre" | "Mujer" | "Accesorios";

export type ProductType =
  | "Pulover"
  | "Short"
  | "Accesorios"
  | "Suplementos"
  | "Camiseta"
  | "Leggings"
  | "Tops"
  | "Licra"
  | "Otro";

export type Product = {
  id: string;
  slug: string;
  name: string;

  category: Category;        // Hombre | Mujer | Accesorios
  productType: ProductType;  // Pulover | Short | Suplementos | etc

  price: number;
  images: string[];
  description?: string;
  sizes: string[];

  badge?: "Nuevo" | "Best seller" | "-15%";
  featured?: boolean;
};