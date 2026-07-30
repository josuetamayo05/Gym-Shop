import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

type ProductDoc = {
  name?: string;
  slug?: string;
  category?: string;
  productType?: string;
  price?: number;
  images?: string[];
  description?: string;
  sizes?: string[];
  badge?: string;
  featured?: boolean;
  active?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

type ProductRow = ProductDoc & {
  id: string;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 👇 Anti-caché
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();

    const snap = await db
      .collection("products")
      .orderBy("createdAt", "asc")
      .get();

    const products: ProductRow[] = snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as ProductDoc),
      }))
      .filter((p) => p.active !== false);

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error en /api/products:", error);
    return res.status(500).json({ error: "Error al cargar productos" });
  }
}