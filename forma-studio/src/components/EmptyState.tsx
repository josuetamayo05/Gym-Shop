import { SearchX } from "lucide-react";

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D8C3A5]/40">
          <SearchX className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">No encontramos resultados</p>
          <p className="mt-1 text-sm text-black/60">
            Probá con otra búsqueda o limpiá filtros.
          </p>

          <button
            onClick={onClear}
            className="mt-4 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}