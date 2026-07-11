import { Search } from "lucide-react";
import { cn } from "../lib/cn";

type Category = "Todos" | "Accesorios" | "Hombre" | "Mujer";
type Sort = "reco" | "price_asc" | "price_desc" | "name_asc";

export function FiltersBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  resultsCount,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  category: Category;
  onCategoryChange: (v: Category) => void;
  sort: Sort;
  onSortChange: (v: Sort) => void;
  resultsCount: number;
}) {
  const categories: Category[] = ["Todos", "Accesorios", "Hombre", "Mujer"];

  return (
    <section className="mb-5 space-y-3">
      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-black/50" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            placeholder="Buscar guantillas, straps, leggings…"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-black/60">{resultsCount} resultados</p>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as Sort)}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="reco">Ordenar: Recomendado</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={cn(
                "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white hover:bg-black/5"
              )}
            >
              {c}
            </button>
          );
        })}
      </div>
    </section>
  );
}