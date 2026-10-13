import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { uploadCloudinaryImages } from "../uploadCloudinary";
import { CATEGORIES, PRODUCT_TYPES, SIZES } from "../constants";
import { slugify } from "../slug";
import { nowMs } from "../now";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Star,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

interface ColorItem {
  name: string;
  hex: string;
}

export function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // ✅ ARREGLO: considerar que la ruta /new NO tiene param id
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [productType, setProductType] = useState<string>(PRODUCT_TYPES[0]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorItem[]>([]);

  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const [active, setActive] = useState(true);
  const [soldOut, setSoldOut] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const docSnap = await getDoc(doc(db, "products", id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setSlug(data.slug || "");
            setCategory(data.category || CATEGORIES[0]);
            setProductType(data.productType || PRODUCT_TYPES[0]);
            setPrice(data.price != null ? data.price.toString() : "");
            setDescription(data.description || "");
            setSelectedSizes(data.sizes || []);
            setColors(data.colors || []); // ✅ fallback
            setActive(data.active ?? true);
            setSoldOut(data.soldOut ?? false);
            setImages(data.images || []);
          } else {
            setError("El producto no existe.");
          }
        } catch (err) {
          console.error(err);
          setError("Error al cargar los datos.");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isEdit, id]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    if (
      colors.some((c) => c.name.toLowerCase() === newColorName.toLowerCase())
    ) {
      alert("Ya existe un color con ese nombre");
      return;
    }
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    setImages(updated);
    setActiveImageIndex(targetIndex);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [cover] = updated.splice(index, 1);
    updated.unshift(cover);
    setImages(updated);
    setActiveImageIndex(0);
  };

  const handleRemoveExistingImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setActiveImageIndex(null);
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Ingresa un precio válido.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let productId = id;
      let finalImages = [...images];

      if (!isEdit) {
        const docRef = await addDoc(collection(db, "products"), {
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          category,
          productType,
          price: parsedPrice,
          description: description.trim(),
          sizes: selectedSizes,
          colors,
          active,
          soldOut,
          images: [],
          displayOrder: nowMs(),
          createdAt: nowMs(),
          updatedAt: nowMs(),
        });
        productId = docRef.id;
      }

      if (newFiles.length > 0 && productId) {
        const uploadedUrls = await uploadCloudinaryImages(productId, newFiles);
        finalImages = [...finalImages, ...uploadedUrls];
      }

      if (productId) {
        await updateDoc(doc(db, "products", productId), {
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          category,
          productType,
          price: parsedPrice,
          description: description.trim(),
          sizes: selectedSizes,
          colors,
          active,
          soldOut,
          images: finalImages,
          updatedAt: nowMs(),
        });
      }

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al guardar.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 px-4 sm:px-6 py-6 pb-28">
      <div className="flex items-center justify-between mb-6 gap-3">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white bg-[#151A23] border border-white/5 px-4 py-3 rounded-2xl min-h-[44px]"
        >
          <ArrowLeft size={18} /> Volver
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-white text-right">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMÁGENES */}
        <div className="bg-[#151A23] border border-white/5 p-4 sm:p-6 rounded-3xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Galería de Imágenes
            </h2>
            <p className="text-xs text-slate-400">
              Toca una imagen para gestionarla.
            </p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div
                  key={url}
                  onClick={() =>
                    setActiveImageIndex(activeImageIndex === idx ? null : idx)
                  }
                  className={`relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 cursor-pointer transition-all ${
                    activeImageIndex === idx
                      ? "border-[#D8C3A5]"
                      : "border-white/10"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Producto ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      PORTADA
                    </span>
                  )}
                  {activeImageIndex === idx && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-2">
                      <div className="flex items-center gap-1 w-full justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveImage(idx, "left");
                          }}
                          disabled={idx === 0}
                          className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white disabled:opacity-30"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveImage(idx, "right");
                          }}
                          disabled={idx === images.length - 1}
                          className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white disabled:opacity-30"
                        >
                          →
                        </button>
                      </div>
                      <div className="flex items-center gap-1 w-full justify-center flex-wrap">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetCover(idx);
                            }}
                            className="px-3 min-h-[40px] bg-amber-500 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1"
                          >
                            <Star size={14} /> Portada
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExistingImage(idx);
                          }}
                          className="px-3 min-h-[40px] bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Quitar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {newFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#D8C3A5]">
                Nuevas fotos por subir:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-white/10"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Nueva"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="absolute top-2 right-2 w-9 h-9 bg-rose-500 text-white rounded-xl flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="border-2 border-dashed border-white/10 hover:border-[#D8C3A5]/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#0B0E14] min-h-[140px] transition-all">
            <Upload size={28} className="text-[#D8C3A5] mb-2" />
            <span className="text-sm font-semibold text-white">
              Toca para subir fotos
            </span>
            <span className="text-xs text-slate-400 mt-1">
              PNG, JPG o WEBP
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setNewFiles([...newFiles, ...Array.from(e.target.files)]);
                }
              }}
            />
          </label>
        </div>

        {/* FORMULARIO */}
        <div className="bg-[#151A23] border border-white/5 p-4 sm:p-6 rounded-3xl space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej. Camiseta Compresión Pro"
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:border-[#D8C3A5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Slug (URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="camiseta-compresion-pro"
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:border-[#D8C3A5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white focus:outline-none focus:border-[#D8C3A5]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tipo de Producto *
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white focus:outline-none focus:border-[#D8C3A5]"
              >
                {PRODUCT_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Precio (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="24.99"
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:border-[#D8C3A5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del tejido, ajuste, cuidados..."
              className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#D8C3A5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tallas disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold min-h-[44px] min-w-[44px] transition-all ${
                      isSelected
                        ? "bg-[#D8C3A5] text-slate-900 shadow-md"
                        : "bg-[#0B0E14] text-slate-400 border border-white/10 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Colores
            </label>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#0B0E14] border border-white/10 px-3 py-2 rounded-xl"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs text-white font-medium">
                      {c.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-full sm:w-16 h-12 bg-[#0B0E14] border border-white/10 rounded-2xl p-1 cursor-pointer"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Nombre (Ej. Negro Mate)"
                className="flex-1 bg-[#0B0E14] border border-white/10 rounded-2xl px-4 py-3 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:border-[#D8C3A5]"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="bg-white/10 text-white font-semibold px-5 min-h-[48px] rounded-2xl flex items-center justify-center gap-1 active:bg-white/20"
              >
                <Plus size={18} /> Añadir
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-5 h-5 accent-[#D8C3A5] rounded"
              />
              <span className="text-sm font-medium text-white">
                Producto activo (visible en la tienda)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={soldOut}
                onChange={(e) => setSoldOut(e.target.checked)}
                className="w-5 h-5 accent-[#D8C3A5] rounded"
              />
              <span className="text-sm font-medium text-white">
                Marcar como Agotado
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#D8C3A5] text-slate-900 font-bold py-4 min-h-[52px] rounded-2xl shadow-xl shadow-[#D8C3A5]/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>{isEdit ? "Guardar Cambios" : "Crear Producto"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}