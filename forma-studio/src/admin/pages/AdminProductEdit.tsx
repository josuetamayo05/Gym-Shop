import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { uploadCloudinaryImages } from "../uploadCloudinary";

import { CATEGORIES, PRODUCT_TYPES, SIZES } from "../constants";
import { slugify } from "../slug";
import { nowMs } from "../now";

type Category = (typeof CATEGORIES)[number];
type ProductType = (typeof PRODUCT_TYPES)[number];

type ProductColor = {
  name: string;
  hex: string;
};

type ProductDoc = {
  name: string;
  slug: string;
  category: Category;
  productType: ProductType;
  price: number;
  description: string;
  sizes: string[];
  colors: ProductColor[];
  active: boolean;
  soldOut: boolean;
  images: string[];
  displayOrder: number;
  createdAt?: number;
  updatedAt?: number;
};

function defaultState(): ProductDoc {
  return {
    name: "",
    slug: "",
    category: "Hombre",
    productType: "Camisetas",
    price: 0,
    description: "",
    sizes: ["Único"],
    colors: [],
    active: true,
    soldOut: false,
    images: [],
    displayOrder: Date.now(),
  };
}

export function AdminProductEdit() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();

  const [state, setState] = useState<ProductDoc>(defaultState());
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Colores
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  useEffect(() => {
    async function load() {
      if (!id) return;
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) return;
      const data = snap.data() as Partial<ProductDoc>;
      setState({
        ...defaultState(),
        ...data,
        soldOut: data.soldOut ?? false,
        images: data.images ?? [],
        colors: data.colors ?? [],
        displayOrder: data.displayOrder ?? Date.now(),
      });
    }
    load();
  }, [id]);

  const sizeSet = useMemo(() => new Set(state.sizes), [state.sizes]);

  function toggleSize(s: string) {
    setState((prev) => {
      const set = new Set(prev.sizes);
      if (set.has(s)) set.delete(s);
      else set.add(s);
      const next = Array.from(set);
      return { ...prev, sizes: next.length ? next : ["Único"] };
    });
  }

  /* ---------- COLORES ---------- */
  function handleAddColor() {
    if (!colorName.trim()) return;
    if (state.colors.some((c) => c.name.toLowerCase() === colorName.toLowerCase())) {
      alert("Ya existe un color con ese nombre");
      return;
    }
    setState((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: colorName.trim(), hex: colorHex }],
    }));
    setColorName("");
    setColorHex("#000000");
  }

  function handleRemoveColor(index: number) {
    setState((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  }

  /* ---------- IMÁGENES ---------- */
  function handleRemoveSavedImage(url: string) {
    setState((prev) => ({
      ...prev,
      images: prev.images.filter((u) => u !== url),
    }));
  }

  function handleMoveImage(index: number, direction: "left" | "right") {
    setState((prev) => {
      const imgs = [...prev.images];
      const swapIdx = direction === "left" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= imgs.length) return prev;
      [imgs[index], imgs[swapIdx]] = [imgs[swapIdx], imgs[index]];
      return { ...prev, images: imgs };
    });
  }

  function handleSetAsCover(index: number) {
    if (index === 0) return;
    setState((prev) => {
      const imgs = [...prev.images];
      const [img] = imgs.splice(index, 1);
      imgs.unshift(img);
      return { ...prev, images: imgs };
    });
  }

  function handleRemoveNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---------- GUARDAR ---------- */
  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      let targetId = id;

      if (!editing) {
        const base: ProductDoc = {
          ...state,
          slug: slugify(state.slug || state.name),
          displayOrder: Date.now(),
          createdAt: nowMs(),
          updatedAt: nowMs(),
        };
        const docRef = await addDoc(collection(db, "products"), base);
        targetId = docRef.id;
      }

      if (!targetId) throw new Error("No se pudo determinar el ID");

      let newUrls: string[] = [];
      if (newFiles.length > 0) {
        newUrls = await uploadCloudinaryImages(targetId, newFiles);
      }

      const finalImages = [...(state.images ?? []), ...newUrls];

      const finalData: ProductDoc = {
        ...state,
        slug: slugify(state.slug || state.name),
        images: finalImages,
        updatedAt: nowMs(),
        createdAt: state.createdAt ?? nowMs(),
      };

      await updateDoc(doc(db, "products", targetId), finalData as any);
      nav("/admin/products");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- RENDER ---------- */
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => nav("/admin/products")}
          className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-semibold">
          {editing ? "Editar" : "Nuevo"} producto
        </h1>
      </div>

      <div className="mt-4 space-y-5 rounded-3xl border border-black/10 bg-white p-4 sm:p-6">

        {/* ====== IMÁGENES (sección principal) ====== */}
        <div className="rounded-2xl border-2 border-dashed border-black/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">📸 Imágenes del producto</p>
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-black/40">
              {state.images.length + newFiles.length} fotos
            </span>
          </div>

          {/* Imágenes guardadas */}
          {state.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 mb-3">
              {state.images.map((url, idx) => (
                <div
                  key={url}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${
                    idx === 0 ? "border-yellow-400 ring-2 ring-yellow-200" : "border-black/10"
                  } bg-white`}
                >
                  <img src={url} alt={`img-${idx}`} className="h-full w-full object-cover" />

                  {/* Badge PORTADA */}
                  {idx === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[8px] font-black text-black shadow">
                      PORTADA
                    </span>
                  )}

                  {/* Overlay de acciones */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Mover izquierda */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, "left")}
                        className="rounded-full bg-white/90 p-1 text-xs font-bold hover:bg-white"
                        title="Mover a la izquierda"
                      >
                        ←
                      </button>
                    )}

                    {/* Mover derecha */}
                    {idx < state.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, "right")}
                        className="rounded-full bg-white/90 p-1 text-xs font-bold hover:bg-white"
                        title="Mover a la derecha"
                      >
                        →
                      </button>
                    )}

                    {/* Hacer portada */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(idx)}
                        className="rounded-full bg-yellow-400 px-2 py-0.5 text-[9px] font-black text-black hover:bg-yellow-300"
                      >
                        ⭐ Portada
                      </button>
                    )}

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSavedImage(url)}
                      className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-red-600"
                    >
                      ✕ Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subir nuevas */}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-black/[0.02] py-6 transition-colors hover:border-black/30 hover:bg-black/5">
            <span className="text-2xl">📁</span>
            <span className="mt-1 text-xs font-semibold text-black/40">
              Toca para subir nuevas fotos
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setNewFiles((prev) => [...prev, ...files]);
              }}
            />
          </label>

          {/* Preview nuevas */}
          {newFiles.length > 0 && (
            <div className="mt-3 rounded-xl bg-green-50 p-2">
              <p className="text-[10px] font-bold text-green-700 mb-2">
                ✅ {newFiles.length} foto(s) lista(s) para subir:
              </p>
              <div className="flex flex-wrap gap-2">
                {newFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="group relative h-16 w-16 overflow-hidden rounded-lg border border-green-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-red-600/80 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-2 text-[10px] text-black/30">
            💡 La primera imagen es la portada del catálogo. Pasa el mouse sobre una foto para reordenarla.
          </p>
        </div>

        {/* ====== DATOS BÁSICOS ====== */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-black/60">Nombre del producto</label>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
              placeholder="Ej: Camiseta Dry-Fit Pro"
              value={state.name}
              onChange={(e) => {
                const name = e.target.value;
                setState((p) => ({
                  ...p,
                  name,
                  slug: p.slug ? p.slug : slugify(name),
                }));
              }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-black/60">Slug (URL)</label>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
              placeholder="camiseta-dry-fit-pro"
              value={state.slug}
              onChange={(e) =>
                setState((p) => ({ ...p, slug: slugify(e.target.value) }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-black/60">Categoría</label>
            <select
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              value={state.category}
              onChange={(e) =>
                setState((p) => ({ ...p, category: e.target.value as Category }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-black/60">Tipo</label>
            <select
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              value={state.productType}
              onChange={(e) =>
                setState((p) => ({ ...p, productType: e.target.value as ProductType }))
              }
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-black/60">Precio (USD)</label>
            <input
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              type="number"
              step="0.01"
              value={state.price}
              onChange={(e) =>
                setState((p) => ({ ...p, price: Number(e.target.value) }))
              }
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-black/60">Descripción</label>
          <textarea
            className="mt-1 min-h-24 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
            placeholder="Describe el producto, materiales, uso recomendado…"
            value={state.description}
            onChange={(e) =>
              setState((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>

        /* ====== TALLAS ====== */
        <div>
          <p className="text-sm font-semibold">Tallas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((s: string) => {
              const active = sizeSet.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5"
                  }`}
                  type="button"
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        /* ====== COLORES ====== */
        <div className="rounded-2xl border border-black/10 p-3">
          <p className="text-sm font-semibold mb-2">🎨 Colores disponibles</p>
          <div className="flex gap-2 items-center mb-3">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-black/10"
            />
            <input
              type="text"
              placeholder="Nombre (Ej: Negro, Azul Neón)"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddColor()}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="shrink-0 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-black/80"
            >
              + Añadir
            </button>
          </div>

          {state.colors.length > 0 ? (
            <div className="flex flex-wrap gap-2 rounded-xl bg-black/5 p-2">
              {state.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white py-1 pl-2 pr-1 text-xs font-medium"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="rounded-full p-0.5 hover:bg-red-100 hover:text-red-600"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black/30 italic">Sin colores definidos.</p>
          )}
        </div>

        /* ====== ESTADO ====== */
        <div className="flex flex-wrap gap-4 rounded-2xl bg-black/[0.02] p-3">
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={state.active}
              onChange={(e) => setState((p) => ({ ...p, active: e.target.checked }))}
            />
            👁️ Visible en catálogo
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={state.soldOut}
              onChange={(e) => setState((p) => ({ ...p, soldOut: e.target.checked }))}
            />
            <span className="text-red-600">🔴 Agotado</span>
          </label>
        </div>

        /* ====== ERROR ====== */
        {error && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        /* ====== BOTÓN GUARDAR ====== */
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[#D8C3A5] px-4 py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#c9b496] disabled:opacity-60"
        >
          {saving ? "⏳ Guardando…" : editing ? "💾 Actualizar Producto" : "✨ Crear Producto"}
        </button>
      </div>
    </main>
  );
}