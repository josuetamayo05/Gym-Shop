export type { Product, Category, ProductType } from "./entities/product/model/types";

export type CartItem = {
  key: string;
  product: import("./entities/product/model/types").Product;
  size: string;
  quantity: number;
};