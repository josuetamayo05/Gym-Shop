import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { CATEGORIES } from "../constants";
import { nowMs } from "../now";
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Edit3,
  Copy,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface ColorOption {
  name: string;
  hex: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  productType: string;
  price: number;
  description: string;
  sizes: string[];
  colors: ColorOption[];
  active: boolean;
  soldOut: boolean;
  images: string[];
  displayOrder: number;
  createdAt: number;
  updatedAt: number;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "activos" | "agotados" | "ocultos"
  >("todos");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Product[];
        setProducts(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener productos:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

    // ✅ Auto-normalizar displayOrder cuando se detecten valores duplicados o faltantes
  useEffect(() => {
    if (loading || products.length === 0) return;

    const orders = products.map((p) => p.displayOrder);
    const hasUndefined = orders.some((o) => o == null);
    const hasDuplicates = new Set(orders).size !== orders.length;

    if (hasUndefined || hasDuplicates) {
      console.log("⚙️ Normalizando displayOrder de productos...");
      const sorted = [...products].sort((a, b) => {
        const aOrder = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });

      Promise.all(
        sorted.map((p, idx) =>
          updateDoc(doc(db, "products", p.id), {
            displayOrder: (idx + 1) * 1000, // dejamos huecos de 1000 entre cada uno
          })
        )
      ).catch((err) => console.error("Error normalizando:", err));
    }
  }, [loading, products]);

  // Lista completa ordenada (para reordenamiento real)
  const sortedProducts = [...products].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  // Lista filtrada (para mostrar)
  const filteredProducts = sortedProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || p.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === "activos") matchesStatus = p.active && !p.soldOut;
    if (statusFilter === "agotados") matchesStatus = p.soldOut;
    if (statusFilter === "ocultos") matchesStatus = !p.active;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "Todos" ||
    statusFilter !== "todos";

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.active && !p.soldOut).length;
  const soldOutCount = products.filter((p) => p.soldOut).length;
  const hiddenCount = products.filter((p) => !p.active).length;

  const handleToggleActive = async (product: Product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        active: !product.active,
        updatedAt: nowMs(),
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleToggleSoldOut = async (product: Product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        soldOut: !product.soldOut,
        updatedAt: nowMs(),
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const { ...productData } = product;
      await addDoc(collection(db, "products"), {
        ...productData,
        name: `${product.name} (Copia)`,
        slug: `${product.slug}-copia-${nowMs().toString().slice(-4)}`,
        active: false,
        createdAt: nowMs(),
        updatedAt: nowMs(),
        displayOrder: nowMs(),
      });
    } catch (error) {
      console.error("Error al duplicar:", error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Eliminar el producto "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

    const handleMove = async (product: Product, direction: "up" | "down") => {
    if (hasActiveFilters) {
      alert(
        "⚠️ Quita los filtros antes de reordenar para evitar errores de orden."
      );
      return;
    }

    const currentIndex = sortedProducts.findIndex((p) => p.id === product.id);
      if (currentIndex === -1) return;

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sortedProducts.length) return;

      const currentItem = sortedProducts[currentIndex];
      const targetItem = sortedProducts[targetIndex];

      // ✅ Validación: si por alguna razón tienen el mismo displayOrder, los diferenciamos
      const currentOrder = currentItem.displayOrder ?? 0;
      const targetOrder = targetItem.displayOrder ?? 0;

      if (currentOrder === targetOrder) {
        console.warn("displayOrder duplicado, forzando valores distintos");
        // El que sube recibe uno menor, el otro queda igual
        const newOrder =
          direction === "up" ? targetOrder - 1 : targetOrder + 1;
        await updateDoc(doc(db, "products", currentItem.id), {
          displayOrder: newOrder,
          updatedAt: nowMs(),
        });
        return;
      }

      try {
        await Promise.all([
          updateDoc(doc(db, "products", currentItem.id), {
            displayOrder: targetOrder,
            updatedAt: nowMs(),
          }),
          updateDoc(doc(db, "products", targetItem.id), {
            displayOrder: currentOrder,
            updatedAt: nowMs(),
          }),
        ]);
      } catch (error) {
        console.error("Error al reordenar:", error);
      }
    };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 px-4 sm:px-6 py-6 pb-28">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Administra tu inventario y visualización en tienda.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-[#D8C3A5] text-slate-900 font-semibold px-5 py-3 rounded-2xl min-h-[48px] shadow-lg shadow-[#D8C3A5]/10 active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-[#151A23] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total</p>
            <p className="text-xl font-bold text-white">{totalCount}</p>
          </div>
        </div>
        <div className="bg-[#151A23] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Activos</p>
            <p className="text-xl font-bold text-white">{activeCount}</p>
          </div>
        </div>
        <div className="bg-[#151A23] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Agotados</p>
            <p className="text-xl font-bold text-white">{soldOutCount}</p>
          </div>
        </div>
        <div className="bg-[#151A23] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ocultos</p>
            <p className="text-xl font-bold text-white">{hiddenCount}</p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-[#151A23] border border-white/5 p-4 rounded-3xl mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl pl-11 pr-4 py-3 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:border-[#D8C3A5]"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white focus:outline-none focus:border-[#D8C3A5]"
            >
              <option value="Todos">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(["todos", "activos", "agotados", "ocultos"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all min-h-[38px] ${
                  statusFilter === status
                    ? "bg-[#D8C3A5] text-slate-900"
                    : "bg-[#0B0E14] text-slate-400 border border-white/5 hover:text-white"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Aviso cuando hay filtros activos */}
        {hasActiveFilters && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs p-2.5 rounded-xl">
            ⚠️ Para reordenar productos, primero quita los filtros activos.
          </div>
        )}
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
          Cargando catálogo...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#151A23] border border-white/5 rounded-3xl">
          <Package size={48} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 font-medium">
            No se encontraron productos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const coverImage =
              product.images?.[0] || "https://placehold.co/150?text=Sin+Foto";
            const positionInSorted = sortedProducts.findIndex(
              (p) => p.id === product.id
            );
            const isFirst = positionInSorted === 0;
            const isLast = positionInSorted === sortedProducts.length - 1;

            return (
              <div
                key={product.id}
                className="bg-[#151A23] border border-white/5 rounded-3xl p-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={coverImage}
                      alt={product.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-800 shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMove(product, "up")}
                            disabled={isFirst || hasActiveFilters}
                            className="w-11 h-11 bg-[#0B0E14] border border-white/10 rounded-xl flex items-center justify-center text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed active:bg-white/10"
                          >
                            <ArrowUp size={18} />
                          </button>
                          <button
                            onClick={() => handleMove(product, "down")}
                            disabled={isLast || hasActiveFilters}
                            className="w-11 h-11 bg-[#0B0E14] border border-white/10 rounded-xl flex items-center justify-center text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed active:bg-white/10"
                          >
                            <ArrowDown size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-[#D8C3A5] mt-0.5">
                        ${product.price?.toFixed(2) ?? "0.00"} USD
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {product.category} • {product.productType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        product.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {product.active ? "Activo" : "Oculto"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        product.soldOut
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {product.soldOut ? "Agotado" : "Disponible"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/5">
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="flex-1 min-w-[90px] min-h-[44px] bg-[#D8C3A5] text-slate-900 font-semibold rounded-xl flex items-center justify-center gap-1.5 px-3 text-xs active:scale-95 transition-all"
                  >
                    <Edit3 size={15} /> Editar
                  </Link>
                  <button
                    onClick={() => handleToggleSoldOut(product)}
                    className="min-h-[44px] px-3 bg-[#0B0E14] border border-white/10 rounded-xl text-xs font-medium text-slate-300 active:bg-white/5"
                  >
                    {product.soldOut ? "Reponer" : "Agotar"}
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="min-h-[44px] px-3 bg-[#0B0E14] border border-white/10 rounded-xl text-xs font-medium text-slate-300 active:bg-white/5"
                  >
                    {product.active ? "Ocultar" : "Activar"}
                  </button>
                  <button
                    onClick={() => handleDuplicate(product)}
                    className="w-11 h-11 bg-[#0B0E14] border border-white/10 rounded-xl flex items-center justify-center text-slate-300 active:bg-white/5"
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="w-11 h-11 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 active:bg-rose-500/20"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}