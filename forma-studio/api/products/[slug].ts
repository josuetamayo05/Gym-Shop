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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug requerido" });
  }

  try {
    const db = getFirestore();

    const snap = await db
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const doc = snap.docs[0];
    const data = doc.data() as ProductDoc;

    return res.status(200).json({ id: doc.id, ...data });
  } catch (error) {
    console.error("Error en /api/products/[slug]:", error);
    return res.status(500).json({ error: "Error al cargar producto" });
  }
}