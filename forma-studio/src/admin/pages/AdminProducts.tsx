import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { nowMs } from "../now";

/* ---------- tipos ---------- */
type ProductDoc = {
  name: string;
  slug: string;
  price: number;
  active: boolean;
  soldOut: boolean;
  category: string;
  productType: string;
  images: string[];
  displayOrder: number;
  updatedAt?: number;
};

type ProductRow = ProductDoc & { id: string };

/* ---------- componente ---------- */
export function AdminProducts() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState<"todos" | "activos" | "ocultos" | "agotados">("todos");

  /* --- cargar productos en tiempo real --- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const rows: ProductRow[] = snap.docs.map((d) => {
        const data = d.data() as DocumentData as ProductDoc;
        return {
          id: d.id,
          ...data,
          soldOut: data.soldOut ?? false,
          active: data.active ?? true,
          images: data.images ?? [],
          displayOrder: data.displayOrder ?? 0,
        };
      });
      setItems(rows);
    });
    return unsub;
  }, []);

  /* --- productos ordenados y filtrados --- */
  const filtered = useMemo(() => {
    let list = [...items];

    // Ordenar por displayOrder (menor = primero)
    list.sort((a, b) => a.displayOrder - b.displayOrder);

    // Buscar por nombre
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Filtrar por categoría
    if (filterCategory !== "Todas") {
      list = list.filter((p) => p.category === filterCategory);
    }

    // Filtrar por estado
    if (filterStatus === "activos") list = list.filter((p) => p.active && !p.soldOut);
    if (filterStatus === "ocultos") list = list.filter((p) => !p.active);
    if (filterStatus === "agotados") list = list.filter((p) => p.soldOut);

    return list;
  }, [items, search, filterCategory, filterStatus]);

  // Categorías únicas para el filtro
  const categories = useMemo(() => {
    const cats = new Set(items.map((p) => p.category));
    return ["Todas", ...Array.from(cats)];
  }, [items]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((p) => p.active && !p.soldOut).length,
    soldOut: items.filter((p) => p.soldOut).length,
    hidden: items.filter((p) => !p.active).length,
  }), [items]);

  /* --- acciones --- */
  async function toggleActive(p: ProductRow) {
    await updateDoc(doc(db, "products", p.id), {
      active: !p.active,
      updatedAt: nowMs(),
    });
  }

  async function toggleSoldOut(p: ProductRow) {
    await updateDoc(doc(db, "products", p.id), {
      soldOut: !p.soldOut,
      updatedAt: nowMs(),
    });
  }

  async function deleteProduct(p: ProductRow) {
    if (!window.confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteDoc(doc(db, "products", p.id));
  }

  async function duplicateProduct(p: ProductRow) {
    const { ...data } = p;
    await addDoc(collection(db, "products"), {
      ...data,
      name: `${p.name} (copia)`,
      slug: `${p.slug}-copia-${Date.now()}`,
      active: false,
      displayOrder: Date.now(),
      createdAt: nowMs(),
      updatedAt: nowMs(),
    });
  }

  async function moveProduct(p: ProductRow, direction: "up" | "down") {
    // La lista ya está ordenada por displayOrder
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((x) => x.id === p.id);
    if (idx < 0) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const neighbor = sorted[swapIdx];

    // Intercambiar displayOrder
    await Promise.all([
      updateDoc(doc(db, "products", p.id), { displayOrder: neighbor.displayOrder, updatedAt: nowMs() }),
      updateDoc(doc(db, "products", neighbor.id), { displayOrder: p.displayOrder, updatedAt: nowMs() }),
    ]);
  }

  /* --- render --- */
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Admin — Productos</h1>
        <Link
          to="/admin/products/new"
          className="rounded-2xl bg-black px-5 py-2.5 text-sm font-semibold text-white text-center"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, color: "bg-black text-white" },
          { label: "Activos", value: stats.active, color: "bg-green-100 text-green-700" },
          { label: "Agotados", value: stats.soldOut, color: "bg-red-100 text-red-700" },
          { label: "Ocultos", value: stats.hidden, color: "bg-gray-100 text-gray-600" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.color}`}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Buscador y Filtros */}
      <div className="mt-4 space-y-2">
        <input
          type="text"
          placeholder="🔍  Buscar producto por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black/30"
        />

        <div className="flex flex-wrap gap-2">
          {/* Filtro categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Filtro estado */}
          {(["todos", "activos", "agotados", "ocultos"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize ${
                filterStatus === s
                  ? "bg-black text-white"
                  : "border border-black/10 hover:bg-black/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de productos */}
      <div className="mt-4 space-y-2">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-black/40">
            No se encontraron productos.
          </p>
        )}

        {filtered.map((p, idx) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 transition-shadow hover:shadow-md"
          >
            {/* Posición */}
            <span className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-[10px] font-bold text-black/40">
              {idx + 1}
            </span>

            {/* Thumbnail */}
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/5">
              {p.images?.[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-black/30">
                  Sin foto
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-black/50">
                {p.category} · {p.productType} · ${p.price}
                {p.images?.length > 0 && (
                  <span className="ml-1">· 📷{p.images.length}</span>
                )}
              </p>
              <div className="mt-0.5 flex gap-1">
                {!p.active && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500">OCULTO</span>
                )}
                {p.soldOut && (
                  <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">AGOTADO</span>
                )}
                {p.active && !p.soldOut && (
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-600">ACTIVO</span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
              {/* Reordenar */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveProduct(p, "up")}
                  disabled={idx === 0}
                  title="Mover arriba"
                  className="rounded-lg border border-black/10 px-1.5 py-0.5 text-[10px] hover:bg-black/5 disabled:opacity-20"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveProduct(p, "down")}
                  disabled={idx === filtered.length - 1}
                  title="Mover abajo"
                  className="rounded-lg border border-black/10 px-1.5 py-0.5 text-[10px] hover:bg-black/5 disabled:opacity-20"
                >
                  ↓
                </button>
              </div>

              {/* Toggle agotado */}
              <button
                onClick={() => toggleSoldOut(p)}
                className={`rounded-xl px-2 py-1.5 text-[10px] font-semibold ${
                  p.soldOut
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "border border-black/10 hover:bg-black/5"
                }`}
              >
                {p.soldOut ? "Reponer" : "Agotar"}
              </button>

              {/* Toggle activo */}
              <button
                onClick={() => toggleActive(p)}
                className="rounded-xl border border-black/10 px-2 py-1.5 text-[10px] font-semibold hover:bg-black/5"
              >
                {p.active ? "Ocultar" : "Activar"}
              </button>

              {/* Duplicar */}
              <button
                onClick={() => duplicateProduct(p)}
                title="Duplicar producto"
                className="rounded-xl border border-black/10 px-2 py-1.5 text-[10px] font-semibold hover:bg-blue-50 hover:text-blue-600"
              >
                📋
              </button>

              {/* Editar */}
              <Link
                to={`/admin/products/${p.id}`}
                className="rounded-xl bg-[#D8C3A5] px-3 py-1.5 text-[10px] font-semibold text-black"
              >
                Editar
              </Link>

              {/* Eliminar */}
              <button
                onClick={() => deleteProduct(p)}
                title="Eliminar producto"
                className="rounded-xl border border-red-200 px-2 py-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info del orden */}
      <p className="mt-4 text-center text-[10px] text-black/30">
        💡 Usa las flechas ↑ ↓ para cambiar el orden en que los clientes ven los productos.
      </p>
    </main>
  );
}