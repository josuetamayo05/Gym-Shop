import type { Product } from "../entities/product/model/types";
import { AccordionSection } from "./AccordionSection";

type CategoryFilter = "Todos" | Product["category"];
type TypeFilter = "Todos" | Product["productType"];

export function FiltersContent({
  category,
  onCategoryChange,

  productTypes,
  productType,
  onProductTypeChange,

  sizes,
  selectedSizes,
  onToggleSize,

  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  minBound,
  maxBound,

  onClear,
}: {
  category: CategoryFilter;
  onCategoryChange: (v: CategoryFilter) => void;

  productTypes: Product["productType"][];
  productType: TypeFilter;
  onProductTypeChange: (v: TypeFilter) => void;

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
  const categories: CategoryFilter[] = ["Todos", "Hombre", "Mujer", "Accesorios"];

  return (
    <div className="space-y-3">
      <AccordionSection title="Categoría" defaultOpen>
        <div className="flex flex-wrap gap-2">
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
      </AccordionSection>

      <AccordionSection title="Tipo de producto" defaultOpen>
        <div className="flex flex-wrap gap-2">
          <Chip active={productType === "Todos"} onClick={() => onProductTypeChange("Todos")}>
            Todos
          </Chip>

          {productTypes.map((t) => (
            <Chip key={t} active={productType === t} onClick={() => onProductTypeChange(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Tallas" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((s) => {
            const checked = selectedSizes.includes(s);
            return (
              <label
                key={s}
                className={
                  "flex cursor-pointer items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold transition " +
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
                {s}
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-black/50">
          Si no seleccionas talla, se muestran todas.
        </p>
      </AccordionSection>

      <AccordionSection title="Precio (USD)" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
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
          Rango: {minBound} – {maxBound}
        </p>
      </AccordionSection>

      <button
        onClick={onClear}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/5"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-2xl border px-4 py-2 text-sm font-semibold transition " +
        (active
          ? "border-black bg-black text-white"
          : "border-black/10 bg-white hover:bg-black/5")
      }
    >
      {children}
    </button>
  );
}