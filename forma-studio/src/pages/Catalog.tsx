import { useMemo, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { products } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { FiltersContent } from "../components/FiltersContent";
import { MobileFiltersDrawer } from "../components/MobileFiltersDrawer";
import type { Product } from "../types";

type CategoryFilter = "Todos" | Product["category"];
type Sort = "reco" | "price_asc" | "price_desc" | "name_asc";

export function Catalog() {
  const minBound = useMemo(
    () => Math.min(...products.map((p) => p.price)),
    []
  );
  const maxBound = useMemo(
    () => Math.max(...products.map((p) => p.price)),
    []
  );

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Todos");
  const [sort, setSort] = useState<Sort>("reco");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(minBound);
  const [priceMax, setPriceMax] = useState<number>(maxBound);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((x) => x !== size) : [...prev, size]
    );
  }

  function clearFilters() {
    setQuery("");
    setCategory("Todos");
    setSort("reco");
    setSelectedSizes([]);
    setPriceMin(minBound);
    setPriceMax(maxBound);
  }

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (category !== "Todos") n++;
    if (selectedSizes.length > 0) n++;
    if (priceMin !== minBound || priceMax !== maxBound) n++;
    if (query.trim().length > 0) n++;
    return n;
  }, [category, selectedSizes.length, priceMin, priceMax, minBound, maxBound, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const min = Math.min(priceMin, priceMax);
    const max = Math.max(priceMin, priceMax);

    let list = products.filter((p) => {
      const matchQuery = q.length === 0 || p.name.toLowerCase().includes(q);
      const matchCat = category === "Todos" || p.category === category;
      const matchSizes =
        selectedSizes.length === 0 ||
        p.sizes.some((s) => selectedSizes.includes(s));
      const matchPrice = p.price >= min && p.price <= max;

      return matchQuery && matchCat && matchSizes && matchPrice;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [query, category, selectedSizes, priceMin, priceMax, sort]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Top bar: search + sort + mobile filters */}
      <section className="mb-5 space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-black/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            placeholder="Buscar guantillas, straps, leggings…"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
          </button>

          <p className="text-xs text-black/60">{filtered.length} resultados</p>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="reco">Ordenar: Recomendado</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
          </select>
        </div>
      </section>

      {/* Layout: sidebar (desktop) + grid */}
      <section className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FiltersContent
              category={category}
              onCategoryChange={setCategory}
              sizes={sizes}
              selectedSizes={selectedSizes}
              onToggleSize={toggleSize}
              priceMin={priceMin}
              priceMax={priceMax}
              onPriceMinChange={setPriceMin}
              onPriceMaxChange={setPriceMax}
              minBound={minBound}
              maxBound={maxBound}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>

          {filtered.length === 0 && (
            <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-6 text-sm text-black/60">
              No encontramos resultados. Probá con otros filtros.
            </div>
          )}
        </div>
      </section>

      {/* Mobile drawer */}
      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
      >
        <FiltersContent
          category={category}
          onCategoryChange={setCategory}
          sizes={sizes}
          selectedSizes={selectedSizes}
          onToggleSize={toggleSize}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={setPriceMin}
          onPriceMaxChange={setPriceMax}
          minBound={minBound}
          maxBound={maxBound}
          onClear={clearFilters}
        />
      </MobileFiltersDrawer>
    </main>
  );
}