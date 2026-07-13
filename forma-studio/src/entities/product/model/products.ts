// src/entities/product/model/products.ts
import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  // -------------------------
  // PULÓVERES
  // -------------------------
  {
    id: "pullover-001",
    slug: "pulover-verano-gym",
    name: "Pulóver Verano-Gym C/U",
    category: "Hombre",
    productType: "Pulover",
    price: 10,
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
    id: "tops-001",
    slug: "tops-mujer",
    name: "Tops Mujer GYM C/U",
    category: "Mujer",
    productType: "Tops",
    price: 9,
    badge: "Nuevo",
    images: [
      "/products/tops/photo_20_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_21_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_22_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_23_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_24_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_25_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_26_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_27_2026-07-13_15-01-28.jpg",
      "/products/tops/photo_28_2026-07-13_15-01-28.jpg",
    ],
    description:
      "Tejido técnico con caída premium y look minimal. Liviano, cómodo y fácil de combinar con shorts o joggers.",
    sizes: ["S"],
  },
  {
    id: "pullover-003",
    slug: "pulover-deportivo-mujer",
    name: "Pulóver Deportivo Mujer",
    category: "Mujer",
    productType: "Pulover",
    price: 12,
    images: [
      "/products/blusas/photo_14_2026-07-13_15-01-27.jpg",
      "/products/blusas/photo_15_2026-07-13_15-01-27.jpg",
      "/products/blusas/photo_16_2026-07-13_15-01-27.jpg",
      "/products/blusas/photo_17_2026-07-13_15-01-27.jpg",
      "/products/blusas/photo_18_2026-07-13_15-01-27.jpg",
      "/products/blusas/photo_19_2026-07-13_15-01-27.jpg",
    ],
    description:
      "Pulóver cropped con fit cómodo y moderno. Perfecto para calentar, ir al gym o estilo athleisure.",
    sizes: ["S"],
  },
  {
    id: "licras-001",
    slug: "licra-mujer",
    name: "Licras Levanta Glúteo",
    category: "Mujer",
    productType: "Licra",
    price: 12,
    featured: true,
    images: [
      "/products/licras/photo_29_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_30_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_31_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_32_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_33_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_34_2026-07-13_15-01-28.jpg",
    ],
    description:
      "Half-zip con cuello alto y estética sport-tech. Ideal para entrenamiento ligero, running o capas.",
    sizes: ["S"],
  },
  {
    id: "pullover-006",
    slug: "pulover-half-zip-performance-hombre-gris",
    name: "Pulóver Half-Zip Performance (Hombre) — Gris",
    category: "Hombre",
    productType: "Pulover",
    price: 12,
    featured: true,
    images: [
      "/products/pullovers/photo_31_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_25_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_26_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_27_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_28_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_29_2026-07-11_16-01-25.jpg",
      "/products/pullovers/photo_30_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Half-zip con cuello alto y estética sport-tech. Ideal para entrenamiento ligero, running o capas.",
    sizes: ["S", "M"],
  },

  // -------------------------
  // SHORTS
  // -------------------------
  {
    id: "shorts-001",
    slug: "shorts-training-7-hombre-negro",
    name: "Shorts Training 7” (Hombre) — Negro",
    category: "Hombre",
    productType: "Short",
    price: 12,
    badge: "-15%",
    images: [
      "/products/shorts/new/photo_1_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_2_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_3_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_4_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_5_2026-07-13_15-01-27.jpg",
    ],
    description:
      "Shorts livianos con secado rápido. Cintura elástica con ajuste y bolsillos laterales discretos.",
    sizes: ["L"],
  },
  {
    id: "shorts-004",
    slug: "shorts-biker-mujer-hueso",
    name: "Shorts Biker Compression (Hombre)",
    category: "Hombre",
    productType: "Short",
    price: 18,
    images: [
      "/products/shorts/photo_18_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_16_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_15_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_14_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Biker con compresión moderada y sensación suave. Perfecto para gym, yoga y looks minimal.",
    sizes: ["M"],
  },
  {
    id: "shorts-005",
    slug: "shorts-biker-mujer-hueso-set-2",
    name: "Shorts Biker Compression (Hombre) — Hueso (Set 2)",
    category: "Hombre",
    productType: "Short",
    price: 18,
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
    sizes: ["L"],
  },
  {
    id: "shorts-006",
    slug: "shorts-biker-mujer-hueso-set-3",
    name: "Shorts Biker Compression (Hombre) — Hueso (Set 3)",
    category: "Hombre",
    productType: "Short",
    price: 13,
    images: [
      "/products/shorts/photo_38_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_35_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_32_2026-07-11_16-01-25.jpg",
      "/products/shorts/photo_14_2026-07-11_16-01-25.jpg",
    ],
    description:
      "Biker con compresión moderada y sensación suave. Perfecto para gym, yoga y looks minimal.",
    sizes: ["XS", "S", "M"],
  },
  {
    id: "shorts-007",
    slug: "shorts-biker-mujer-hueso-set-4",
    name: "Shorts Biker Compression (Hombre) — Hueso (Set 4)",
    category: "Hombre",
    productType: "Short",
    price: 14,
    images: [
      "/products/shorts/new/photo_6_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_8_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_9_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_10_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_11_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_12_2026-07-13_15-01-27.jpg",
      "/products/shorts/new/photo_13_2026-07-13_15-01-27.jpg",
    ],
    description:
      "Biker con compresión moderada y sensación suave. Perfecto para gym, yoga y looks minimal.",
    sizes: ["M"],
  },
  {
    id: "licras-002",
    slug: "licra-mujer",
    name: "Licras Gym Levanta Glúteo",
    category: "Mujer",
    productType: "Licra",
    price: 7,
    featured: true,
    images: [
      "/products/licras/photo_35_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_36_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_37_2026-07-13_15-01-28.jpg",
      "/products/licras/photo_38_2026-07-13_15-01-28.jpg",
    ],
    description:
      "Half-zip con cuello alto y estética sport-tech. Ideal para entrenamiento ligero, running o capas.",
    sizes: ["M"],
  },
  {
    id: "licras-003",
    slug: "licra-mujer",
    name: "Licras Gym Levanta Glúteo",
    category: "Mujer",
    productType: "Licra",
    price: 8,
    featured: true,
    images: [
      "/products/licras/photo_1_2026-07-13_15-47-18.jpg",
      "/products/licras/photo_2_2026-07-13_15-47-18.jpg",
      "/products/licras/photo_3_2026-07-13_15-47-18.jpg",
      "/products/licras/photo_4_2026-07-13_15-47-18.jpg",
    ],
    description:
      "Half-zip con cuello alto y estética sport-tech. Ideal para entrenamiento ligero, running o capas.",
    sizes: ["S"],
  },
];