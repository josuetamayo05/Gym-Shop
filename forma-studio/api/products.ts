// api/products.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Inicializa Firebase Admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export default async function handler(req: Request) {
  try {
    const db = getFirestore();
    const snap = await db
      .collection("products")
      .where("active", "==", true)
      .orderBy("updatedAt", "desc")
      .get();

    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return new Response(JSON.stringify(products), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error" }), { status: 500 });
  }
}

export const config = { runtime: "edge" };