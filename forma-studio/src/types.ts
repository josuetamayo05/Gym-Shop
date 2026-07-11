export type { Product, Category } from "./entities/product/model/types";

export type CartItem = {
  key: string;     // productId__size
  product: import("./entities/product/model/types").Product;
  size: string;
  quantity: number;
};