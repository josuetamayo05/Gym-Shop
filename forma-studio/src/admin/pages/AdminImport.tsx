import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { nowMs } from "../now";
import { ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, FileCode } from "lucide-react";

export function AdminImport() {
  const [jsonText, setJsonText] = useState("");
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [parseError, setParseError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const nav = useNavigate();

  // Validar JSON en tiempo real al pegar
  function handleTextChange(val: string) {
    setJsonText(val);
    setParseError("");
    setSuccessCount(null);

    if (!val.trim()) {
      setParsedItems([]);
      return;
    }

    try {
      const data = JSON.parse(val);
      const items = Array.isArray(data) ? data : [data];
      setParsedItems(items);
    } catch (err) {
      setParseError("El texto no es un JSON válido. Asegúrate de copiarlo completo."+err);
      setParsedItems([]); 
    }
  }

  // Subir todo en un solo lote (Batch) a Firestore
  async function handleBatchUpload() {
    if (parsedItems.length === 0) return;
    setLoading(true);
    setParseError("");

    try {
      const batch = writeBatch(db);
      const productsRef = collection(db, "products");
      const baseTime = nowMs();

      parsedItems.forEach((item, idx) => {
        const newDocRef = doc(productsRef);
        batch.set(newDocRef, {
          name: item.name || "Producto sin nombre",
          slug: item.slug || `producto-${baseTime}-${idx}`,
          category: item.category || "Hombre",
          productType: item.productType || "Camisetas",
          price: Number(item.price) || 0,
          description: item.description || "",
          sizes: Array.isArray(item.sizes) ? item.sizes : ["Único"],
          colors: Array.isArray(item.colors) ? item.colors : [],
          active: item.active ?? true,
          soldOut: item.soldOut ?? false,
          images: Array.isArray(item.images) ? item.images : [],
          displayOrder: baseTime + idx * 10,
          createdAt: baseTime,
          updatedAt: baseTime,
        });
      });

      await batch.commit();
      setSuccessCount(parsedItems.length);
      setJsonText("");
      setParsedItems([]);
    } catch (e: any) {
      console.error(e);
      setParseError(e?.message || "Error al subir los productos a Firebase");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 px-4 sm:px-6 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white bg-[#151A23] border border-white/5 px-4 py-3 rounded-2xl min-h-[44px]"
        >
          <ArrowLeft size={18} /> Volver
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-white">
          Importación Inteligente
        </h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Tarjeta de instrucciones */}
        <div className="bg-[#151A23] border border-white/5 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#D8C3A5]/10 text-[#D8C3A5] rounded-xl">
              <FileCode size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Carga Masiva con IA</h2>
              <p className="text-xs text-slate-400">Pega aquí el JSON que te genera el chat.</p>
            </div>
          </div>
        </div>

        {/* Textarea para pegar el JSON */}
        <div className="bg-[#151A23] border border-white/5 p-5 rounded-3xl space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            Pega el código JSON aquí:
          </label>
          <textarea
            rows={10}
            value={jsonText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder='[ { "name": "Camiseta Oversize...", "price": 25.99 ... } ]'
            className="w-full bg-[#0B0E14] border border-white/10 rounded-2xl p-4 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-[#D8C3A5]"
          />

          {/* Errores de sintaxis */}
          {parseError && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successCount !== null && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                <span>¡Se importaron con éxito <strong>{successCount} productos</strong>!</span>
              </div>
              <button
                onClick={() => nav("/admin/products")}
                className="underline font-bold text-xs hover:text-white"
              >
                Ver Catálogo →
              </button>
            </div>
          )}

          {/* Vista previa antes de importar */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Productos detectados:</span>
                <span className="text-[#D8C3A5] font-bold">{parsedItems.length} artículos</span>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {parsedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0B0E14] border border-white/5 px-3 py-2 rounded-xl text-xs">
                    <span className="text-white font-medium truncate max-w-[200px]">{item.name || "Sin nombre"}</span>
                    <span className="text-slate-400">{item.category} • ${item.price}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleBatchUpload}
                disabled={loading}
                className="w-full bg-[#D8C3A5] text-slate-900 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-lg"
              >
                <UploadCloud size={18} />
                <span>{loading ? "Subiendo a Firestore..." : `Subir ${parsedItems.length} productos a la Tienda`}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}