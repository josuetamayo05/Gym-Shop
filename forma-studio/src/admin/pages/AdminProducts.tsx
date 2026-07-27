import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { nowMs } from "../now";

type ProductDoc = {
  name: string;
  slug: string;
  price: number;
  active: boolean;
  category: string;
  productType: string;
  updatedAt?: number;
};

type ProductRow = ProductDoc & { id: string };

export function AdminProducts() {
  const [items, setItems] = useState<ProductRow[]>([]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("updatedAt", "desc"));

    return onSnapshot(q, (snap) => {
      const rows: ProductRow[] = snap.docs.map((d) => {
        const data = d.data() as DocumentData as ProductDoc;
        return { id: d.id, ...data };
      });
      setItems(rows);
    });
  }, []);

  async function toggleActive(p: ProductRow) {
    await updateDoc(doc(db, "products", p.id), {
      active: !p.active,
      updatedAt: nowMs(),
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Admin — Productos</h1>
        <Link
          to="/admin/products/new"
          className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          + Nuevo
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-black/60">
                {p.category} · {p.productType} · ${p.price} ·{" "}
                {p.active ? "Activo" : "Oculto"}
              </p>
              <p className="text-xs text-black/40">/{p.slug}</p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => toggleActive(p)}
                className="rounded-2xl border border-black/10 px-3 py-2 text-xs font-semibold hover:bg-black/5"
              >
                {p.active ? "Ocultar" : "Activar"}
              </button>

              <Link
                to={`/admin/products/${p.id}`}
                className="rounded-2xl bg-[#D8C3A5] px-3 py-2 text-xs font-semibold text-black"
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}