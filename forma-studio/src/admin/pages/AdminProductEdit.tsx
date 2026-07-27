import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db} from "../../firebase";
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
  images: string[];
  createdAt?: number;
  updatedAt?: number;
};

function defaultState(): ProductDoc {
  return {
    name: "",
    slug: "",
    category: "Hombre",
    productType: "Pulover",
    price: 0,
    description: "",
    sizes: ["Único"],
    active: true,
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

  useEffect(() => {
    async function load() {
      if (!id) return;
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) return;
      setState(snap.data() as ProductDoc);
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

  async function uploadImages(productId: string) {
    return await uploadCloudinaryImages(productId, newFiles);
    }

  async function handleSave() {
    setSaving(true);
    try {
      const base: ProductDoc = {
        ...state,
        slug: slugify(state.slug || state.name),
        updatedAt: nowMs(),
        createdAt: state.createdAt ?? nowMs(),
      };

      if (!editing) {
        const docRef = await addDoc(collection(db, "products"), base);
        const urls = await uploadImages(docRef.id);
        if (urls.length) {
          await updateDoc(doc(db, "products", docRef.id), {
            images: [...(state.images ?? []), ...urls],
            updatedAt: nowMs(),
          });
        }
      } else {
        await updateDoc(doc(db, "products", id!), base);
        const urls = await uploadImages(id!);
        if (urls.length) {
          await updateDoc(doc(db, "products", id!), {
            images: [...(state.images ?? []), ...urls],
            updatedAt: nowMs(),
          });
        }
      }

      nav("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold">
        Admin — {editing ? "Editar" : "Nuevo"} producto
      </h1>

      <div className="mt-4 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
        <input
          className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Nombre"
          value={state.name}
          onChange={(e) => {
            const name = e.target.value;
            setState((p) => ({ ...p, name, slug: p.slug ? p.slug : slugify(name) }));
          }}
        />

        <input
          className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Slug (url)"
          value={state.slug}
          onChange={(e) => setState((p) => ({ ...p, slug: slugify(e.target.value) }))}
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            value={state.category}
            onChange={(e) => setState((p) => ({ ...p, category: e.target.value as Category }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            value={state.productType}
            onChange={(e) => setState((p) => ({ ...p, productType: e.target.value as ProductType }))}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <input
          className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Precio (USD)"
          type="number"
          value={state.price}
          onChange={(e) => setState((p) => ({ ...p, price: Number(e.target.value) }))}
        />

        <textarea
          className="min-h-24 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
          placeholder="Descripción"
          value={state.description}
          onChange={(e) => setState((p) => ({ ...p, description: e.target.value }))}
        />

        <div>
          <p className="text-sm font-semibold">Tallas (fijas)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((s) => {
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

        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={state.active}
            onChange={(e) => setState((p) => ({ ...p, active: e.target.checked }))}
          />
          Activo (visible en catálogo)
        </label>

        <div>
          <p className="text-sm font-semibold">Subir fotos (galería del móvil)</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
            className="mt-2 w-full text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-[#D8C3A5] px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </main>
  );
}