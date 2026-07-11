import type { Product } from "../types";

export const products: Product[] = [
  {
    id: "p1",
    name: "Guantillas Pro Grip",
    price: 29,
    category: "Accesorios",
    sizes: ["Único"],
    description: "Guantillas con agarre y ventilación. Ideales para entrenamiento de fuerza.",
    images: [
      "https://images.unsplash.com/photo-1599058917765-1b1b0b4b0b6d?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "Nuevo",
  },
  {
    id: "p4",
    name: "Camiseta Dry-Fit (Hombre)",
    price: 39,
    category: "Hombre",
    sizes: ["S", "M", "L", "XL"],
    description: "Tejido liviano y respirable, corte atlético.",
    images: [
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "Nuevo",
  },
  {
    id: "p5",
    name: "Leggings Seamless (Mujer)",
    price: 45,
    category: "Mujer",
    sizes: ["XS", "S", "M", "L"],
    description: "Seamless, alta compresión, confort premium.",
    images: [
      "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "Nuevo",
  },
];