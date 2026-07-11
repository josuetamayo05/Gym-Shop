export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: "Accesorios" | "Hombre" | "Mujer";
  sizes: string[];
  description?: string;

  badge?: string; // NUEVO (opcional): "Nuevo", "-15%", "Best seller"
};

export type CartItem = {
  key: string;              // NUEVO (id+talle)
  product: Product;
  size: string;             // NUEVO
  quantity: number;
};