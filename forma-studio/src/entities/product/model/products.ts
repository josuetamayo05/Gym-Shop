// src/entities/product/model/products.ts
import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  // -------------------------
  // PULÓVERES (4)
  // -------------------------
  {
    id: "pullover-001",
    slug: "pulover-fleece-hombre-negro",
    name: "Pulóver Fleece (Hombre) — Negro",
    category: "Hombre",
    price: 12,
    badge: "Best seller",
    featured: true,
    images: [
      "/products/pullovers/photo_44_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_1_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_2_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_3_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_4_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_5_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Pulóver fleece de tacto suave con fit oversize. Ideal para pre/pos entreno. Puños elásticos y cuello redondo.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "pullover-002",
    slug: "pulover-tech-knit-unisex-beige",
    name: "Pulóver Tech Knit (Unisex) — Beige",
    category: "Hombre",
    price: 12,
    badge: "Nuevo",
    images: [
      "/products/pullovers/photo_3_2026-07-11_16-01-25.jpg",
      "/products/pullovers/pullover-002-2.jpg",
      "/products/pullovers/pullover-002-3.jpg",
    ],
    description:
      "Tejido técnico con caída premium y look minimal. Liviano, cómodo y fácil de combinar con shorts o joggers.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "pullover-003",
    slug: "pulover-cropped-training-mujer-hueso",
    name: "Pulóver Cropped Training (Mujer) — Hueso",
    category: "Hombre",
    price: 12,
    images: [
      "/products/pullovers/photo_4_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Pulóver cropped con fit cómodo y moderno. Perfecto para calentar, ir al gym o estilo athleisure.",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "pullover-004",
    slug: "pulover-half-zip-performance-mujer-gris",
    name: "Pulóver Half-Zip Performance ",
    category: "Hombre",
    price: 12,
    featured: true,
    images: [
      "/products/pullovers/photo_5_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Half-zip con cuello alto y estética sport-tech. Ideal para entrenamiento ligero, running o capas.",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "pullover-006",
    slug: "pulover-half-s",
    name: "Pulóver Half-Zip Performance (Hombre) — Gris",
    category: "Hombre",
    price: 12,
    featured: true,
    images: [
      "/products/pullovers/photo_25_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_26_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_27_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_28_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_29_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_30_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Half-zip con cuello alto y estética sport-tech. Ideal para entrenamiento ligero, running o capas.",
    sizes: ["XS", "S", "M", "L"],
  },

  // -------------------------
  // SHORTS (4)
  // -------------------------
  {
    id: "shorts-001",
    slug: "shorts-training-7-hombre-negro",
    name: "Shorts Training 7” (Hombre) — Negro",
    category: "Hombre",
    price: 15,
    badge: "-15%",
    images: [
      "/products/shorts/photo_13_2026-07-11_16-01-25.jpg",
      "/products/photo_12_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Shorts livianos con secado rápido. Cintura elástica con ajuste y bolsillos laterales discretos.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "shorts-002",
    slug: "shorts-2en1-hombre-beige",
    name: "Shorts 2 en 1 (Hombre) — Beige",
    category: "Hombre",
    price: 15,
    featured: true,
    images: [
      "/products/shorts/photo_10_2026-07-11_16-01-25.jpg",
      "/products/shorts/shorts-002-2.jpg",
      "/products/shorts/shorts-002-3.jpg",
    ],
    description:
      "Shorts 2 en 1 con calza interior para soporte. Diseñados para fuerza, cardio y entrenamiento funcional.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "shorts-003",
    slug: "shorts-seamless-mujer-negro",
    name: "Shorts Seamless (Mujer) — Negro",
    category: "Mujer",
    price: 15,
    badge: "Best seller",
    images: [
      "/products/shorts/photo_9_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_8_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_6_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_7_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Seamless de alta comodidad, cintura alta y ajuste firme. Ideal para pierna/glúteo y uso diario.",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "shorts-004",
    slug: "shorts-biker-mujer-hueso",
    name: "Shorts Biker Compression (Mujer) — Hueso",
    category: "Mujer",
    price: 15,
    images: [
      "/products/shorts/photo_18_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_16_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_15_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_14_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Biker con compresión moderada y sensación suave. Perfecto para gym, yoga y looks minimal.",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "shorts-005",
    slug: "shorts-biker-mujer-hueso",
    name: "Shorts Biker Compression (Mujer) — Hueso",
    category: "Mujer",
    price: 15,
    images: [
      "/products/shorts/photo_24_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_23_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_22_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_21_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_20_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_19_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Biker con compresión moderada y sensación suave. Perfecto para gym, yoga y looks minimal.",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "shorts-006",
    slug: "shorts-biker-mujer-hueso",
    name: "Shorts Biker Compression (Mujer) — Hueso",
    category: "Mujer",
    price: 15,
    images: [
      "/products/shorts/photo_38_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_35_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_32_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_14_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Biker con compresión moderada y sensación suave. Perfecto para gym, yoga y looks minimal.",
    sizes: ["XS", "S", "M", "L"],
  },
];