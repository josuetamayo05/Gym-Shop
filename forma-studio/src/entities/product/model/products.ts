// src/entities/product/model/products.ts
import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  // =========================
  // PULÓVERES (Hombre / Mujer)
  // =========================
  {
    id: "pullover-001",
    slug: "pulover-verano-gym",
    name: "Pulóver Training Ligero — Hombre",
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
      "Pulóver deportivo ligero, ideal para calentamiento y post-entreno. Tejido suave, fit cómodo y estilo minimal para gym o uso diario.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "pullover-003",
    slug: "pulover-deportivo-mujer",
    name: "Pulóver Deportivo — Mujer",
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
      "Pulóver/blusa deportiva para entrenar o salir. Ligero y cómodo, perfecto como capa sobre top. Ideal para días frescos y rutinas de gym.",
    sizes: ["S"],
  },
  {
    id: "pullover-006",
    slug: "pulover-half-zip-performance-hombre-gris",
    name: "Pulóver Half‑Zip Performance — Hombre (Gris)",
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
      "Pulóver half‑zip con cuello alto y look sport‑tech. Ideal para calentar, entrenar suave o usar en capas. Cómodo y fácil de combinar.",
    sizes: ["S", "M"],
  },

  // =========================
  // TOPS (Mujer)
  // =========================
  {
    id: "tops-001",
    slug: "tops-mujer",
    name: "Top Deportivo Training — Mujer",
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
      "Top deportivo cómodo y elástico para entrenar. Diseñado para movilidad y soporte en gym. Perfecto para combinar con licras o shorts.",
    sizes: ["S"],
  },

  // =========================
  // LICRAS (Mujer)
  // =========================
  {
    id: "licras-001",
    slug: "licras-levanta-gluteo-1",
    name: "Licra Levanta Glúteo — Mujer (Modelo 1)",
    category: "Mujer",
    productType: "Licra",
    price: 7,
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
      "Licra de entrenamiento con ajuste firme y cintura alta. Pensada para acompañar el movimiento y ofrecer un fit favorecedor. Ideal para pierna/glúteo y uso diario.",
    sizes: ["S"],
  },
  {
    id: "licras-002",
    slug: "licras-levanta-gluteo-2",
    name: "Licra Levanta Glúteo — Mujer (Modelo 2)",
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
      "Licra para gym con buena elasticidad y fit cómodo. Cintura alta para mayor sujeción y confianza durante la rutina. Ideal para combinar con tops.",
    sizes: ["M"],
  },
  {
    id: "licras-003",
    slug: "licras-levanta-gluteo-3",
    name: "Licra Levanta Glúteo — Mujer (Modelo 3)",
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
      "Licra deportiva de ajuste favorecedor, ideal para fuerza y cardio. Diseñada para moverte libre y sentir soporte durante todo el entrenamiento.",
    sizes: ["S"],
  },

  // =========================
  // SHORTS (Hombre)
  // =========================
  {
    id: "shorts-001",
    slug: "shorts-training-7-hombre-negro",
    name: "Short Training 7” — Hombre (Negro)",
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
      "Short de entrenamiento ligero y cómodo. Ideal para gym y uso diario. Cintura elástica con ajuste para moverte sin restricciones.",
    sizes: ["L"],
  },
  {
    id: "shorts-004",
    slug: "shorts-biker-compression-hombre-1",
    name: "Short Biker Compression — Hombre (Modelo 1)",
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
      "Short tipo biker con ajuste ceñido y sensación de soporte. Perfecto para rutinas intensas, funcional y cardio. Cómodo y estable al movimiento.",
    sizes: ["M"],
  },
  {
    id: "shorts-005",
    slug: "shorts-biker-compression-hombre-2",
    name: "Short Biker Compression — Hombre (Modelo 2)",
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
      "Short biker de estilo minimal con fit cómodo. Diseñado para gym: se adapta al cuerpo y acompaña el movimiento. Ideal para combinar con pulóver o camiseta.",
    sizes: ["L"],
  },
  {
    id: "shorts-006",
    slug: "shorts-biker-compression-hombre-3",
    name: "Short Biker Compression — Hombre (Modelo 3)",
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
      "Short biker con fit firme y cómodo. Buena movilidad y sensación de soporte para entrenamientos de gym o uso diario.",
    sizes: ["XS", "S", "M"],
  },
  {
    id: "shorts-007",
    slug: "shorts-biker-compression-hombre-4",
    name: "Short Biker Compression — Hombre (Modelo 4)",
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
      "Short biker para entrenamiento con estilo limpio. Ajuste cómodo y soporte durante la rutina. Ideal para combinar con pulóver o top.",
    sizes: ["M"],
  },
];