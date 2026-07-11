import type { Product } from "../types";

type CategoryFilter = "Todos" | Product["category"];

export function FiltersContent({
  category,
  onCategoryChange,
  sizes,
  selectedSizes,
  onToggleSize,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  onClear,
  minBound,
  maxBound,
}: {
  category: CategoryFilter;
  onCategoryChange: (v: CategoryFilter) => void;

  sizes: string[];
  selectedSizes: string[];
  onToggleSize: (size: string) => void;

  priceMin: number;
  priceMax: number;
  onPriceMinChange: (v: number) => void;
  onPriceMaxChange: (v: number) => void;

  minBound: number;
  maxBound: number;

  onClear: () => void;
}) {
  const categories: CategoryFilter[] = ["Todos", "Accesorios", "Hombre", "Mujer"];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-black/10 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">
          Categoría
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => onCategoryChange(c)}
                className={
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition " +
                  (active
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white hover:bg-black/5")
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">
          Talles
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {sizes.map((s) => {
            const checked = selectedSizes.includes(s);
            return (
              <label
                key={s}
                className={
                  "flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition " +
                  (checked
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white hover:bg-black/5")
                }
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => onToggleSize(s)}
                />
                <span>{s}</span>
              </label>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-black/50">
          Tip: si no elegís talle, se muestran todos.
        </p>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">
          Precio (USD)
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-black/50">Mín</p>
            <input
              type="number"
              min={minBound}
              max={maxBound}
              value={priceMin}
              onChange={(e) => onPriceMinChange(Number(e.target.value))}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
            />
          </div>

          <div>
            <p className="text-xs text-black/50">Máx</p>
            <input
              type="number"
              min={minBound}
              max={maxBound}
              value={priceMax}
              onChange={(e) => onPriceMaxChange(Number(e.target.value))}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-black/50">
          Rango recomendado: {minBound} – {maxBound}
        </p>
      </div>

      <button
        onClick={onClear}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/5"
      >
        Limpiar filtros
      </button>
    </div>
  );
}