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

type ProductDoc = {
  name: string;
  slug: string;
  category: Category;
  productType: ProductType;
  price: number;
  description: string;
  sizes: string[];
  active: boolean;
  soldOut: boolean;
  images: string[];
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
    active: true,
    soldOut: false,
    images: [],
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

  // Eliminar una imagen existente del producto
  function handleRemoveSavedImage(urlToRemove: string) {
    setState((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== urlToRemove),
    }));
  }

  // Quitar una de las fotos nuevas seleccionadas antes de subirlas
  function handleRemoveNewFile(indexToRemove: number) {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      let targetId = id;

      // 1. Si es un producto nuevo, lo creamos primero para obtener un ID para Cloudinary
      if (!editing) {
        const base: ProductDoc = {
          ...state,
          slug: slugify(state.slug || state.name),
          createdAt: nowMs(),
          updatedAt: nowMs(),
        };
        const docRef = await addDoc(collection(db, "products"), base);
        targetId = docRef.id;
      }

      if (!targetId) throw new Error("No se pudo determinar el ID del producto");

      // 2. Subimos las nuevas imágenes a Cloudinary (si hay)
      let newUrls: string[] = [];
      if (newFiles.length > 0) {
        newUrls = await uploadCloudinaryImages(targetId, newFiles);
      }

      // 3. Juntamos las imágenes que se quedaron + las nuevas subidas
      const finalImages = [...(state.images ?? []), ...newUrls];

      // 4. Actualizamos el documento con todos los datos finales y ordenados
      const finalProductData: ProductDoc = {
        ...state,
        slug: slugify(state.slug || state.name),
        images: finalImages,
        updatedAt: nowMs(),
        createdAt: state.createdAt ?? nowMs(),
      };

      await updateDoc(doc(db, "products", targetId), finalProductData as any);

      nav("/admin/products");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">
        Admin — {editing ? "Editar" : "Nuevo"} producto
      </h1>

      <div className="mt-4 space-y-4 rounded-3xl border border-black/10 bg-white p-4">
        <div>
          <label className="text-xs font-semibold text-black/60">Nombre</label>
          <input
            className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            placeholder="Nombre"
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
            className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            placeholder="Slug (url)"
            value={state.slug}
            onChange={(e) =>
              setState((p) => ({ ...p, slug: slugify(e.target.value) }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-black/60">Categoría</label>
            <select
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              value={state.category}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  category: e.target.value as Category,
                }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-black/60">Tipo de Producto</label>
            <select
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              value={state.productType}
              onChange={(e) =>
                setState((p) => ({
                  ...p,
                  productType: e.target.value as ProductType,
                }))
              }
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-black/60">Precio (USD)</label>
          <input
            className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            placeholder="Precio (USD)"
            type="number"
            value={state.price}
            onChange={(e) =>
              setState((p) => ({ ...p, price: Number(e.target.value) }))
            }
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-black/60">Descripción</label>
          <textarea
            className="mt-1 min-h-24 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            placeholder="Descripción"
            value={state.description}
            onChange={(e) =>
              setState((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>

        <div>
          <p className="text-sm font-semibold">Tallas (fijas)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((s: string) => {
              const active = sizeSet.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={
                    "rounded-2xl border px-3 py-2 text-sm font-semibold " +
                    (active
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:bg-black/5")
                  }
                  type="button"
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 py-2">
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={state.active}
              onChange={(e) =>
                setState((p) => ({ ...p, active: e.target.checked }))
              }
            />
            Activo (visible en catálogo)
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={state.soldOut}
              onChange={(e) =>
                setState((p) => ({ ...p, soldOut: e.target.checked }))
              }
            />
            <span className="text-red-600">Agotado</span>
          </label>
        </div>

        {/* --- SECCIÓN DE IMÁGENES GUARDADAS --- */}
        {state.images && state.images.length > 0 && (
          <div className="rounded-2xl border border-black/10 p-3 bg-black/5">
            <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">
              Imágenes actuales ({state.images.length})
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {state.images.map((url, idx) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-white"
                >
                  <img
                    src={url}
                    alt={`Producto ${idx}`}
                    className="h-full w-full object-cover"
                  />
                  {/* Botón para eliminar la imagen */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSavedImage(url)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1.5 text-white shadow transition-transform active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Eliminar imagen"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECCIÓN PARA SUBIR NUEVAS IMÁGENES --- */}
        <div className="rounded-2xl border border-black/10 p-3">
          <p className="text-xs font-bold text-black/60 uppercase tracking-wider">
            Subir nuevas fotos
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setNewFiles((prev) => [...prev, ...files]);
            }}
            className="mt-2 w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-black file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-black/80"
          />

          {/* Previsualización antes de subir */}
          {newFiles.length > 0 && (
            <div className="mt-3 border-t border-black/5 pt-3">
              <p className="text-xs font-semibold text-black/50 mb-2">
                Fotos por subir ({newFiles.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {newFiles.map((file, idx) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={idx}
                      className="group relative h-16 w-16 overflow-hidden rounded-xl border border-black/10 bg-white"
                    >
                      <img
                        src={previewUrl}
                        alt="Previsualización"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="absolute inset-0 flex items-center justify-center bg-red-600/80 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar Producto"}
        </button>
      </div>
    </main>
  );
}