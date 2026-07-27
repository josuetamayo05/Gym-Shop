import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { PRODUCTS } from "../../entities/product/model/products";
import { nowMs } from "../now";

export function AdminSeed() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function seed() {
    setLoading(true);
    setDone(false);
    setError("");

    try {
      for (const p of PRODUCTS) {
        // Usamos el mismo ID local como ID de Firestore (simple)
        await setDoc(doc(db, "products", p.id), {
          ...p,
          active: p.active ?? true,
          createdAt: nowMs(),
          updatedAt: nowMs(),
        });
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-xl font-semibold">Admin — Importar catálogo</h1>
      <p className="mt-2 text-sm text-black/60">
        Importa los productos locales a Firestore (1 vez).
      </p>

      <button
        onClick={seed}
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Importando…" : "Importar PRODUCTS → Firestore"}
      </button>

      {done && <p className="mt-3 text-sm font-semibold text-green-700">Listo.</p>}
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </main>
  );
}