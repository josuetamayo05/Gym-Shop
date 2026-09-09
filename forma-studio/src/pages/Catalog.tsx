import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { useProducts } from "../entities/product/model/useProducts";
import type { Product } from "../entities/product/model/types";

import { ProductCard } from "../entities/product/ui/ProductCard";
import { FiltersContent } from "../components/FiltersContent";
import { MobileFiltersDrawer } from "../components/MobileFiltersDrawer";
import { EmptyState } from "../components/EmptyState";

type CategoryFilter = "Todos" | Product["category"];
type TypeFilter = "Todos" | Product["productType"];
type Sort = "reco" | "price_asc" | "price_desc" | "name_asc";

export function Catalog() {
  const { products: PRODUCTS, source } = useProducts();

  const { minBound, maxBound, sizes, productTypes } = useMemo(() => {
    const prices = PRODUCTS.map((p) => p.price);
    const minBound = prices.length ? Math.min(...prices) : 0;
    const maxBound = prices.length ? Math.max(...prices) : 0;

    const order = ["Único", "XS", "S", "M", "L", "XL", "XXL"];
    const sizesSet = new Set<string>();
    PRODUCTS.forEach((p) => (p.sizes ?? []).forEach((s) => sizesSet.add(s)));

    const sizes = Array.from(sizesSet).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return a.localeCompare(b);
    });

    const typeSet = new Set<Product["productType"]>();
    PRODUCTS.forEach((p) => typeSet.add(p.productType));
    const productTypes = Array.from(typeSet).sort((a, b) => a.localeCompare(b));

    return { minBound, maxBound, sizes, productTypes };
  }, [PRODUCTS]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Todos");
  const [productType, setProductType] = useState<TypeFilter>("Todos");
  const [sort, setSort] = useState<Sort>("reco");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // ✅ Usamos null para saber si el usuario ha tocado los filtros manualmente
  const [userPriceMin, setUserPriceMin] = useState<number | null>(null);
  const [userPriceMax, setUserPriceMax] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ✅ Precios efectivos derivados en el renderizado (sin useEffect que rompa ESLint)
  const priceMin = userPriceMin ?? minBound;
  const priceMax = userPriceMax ?? maxBound;

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((x) => x !== size) : [...prev, size]
    );
  }

  function clearFilters() {
    setQuery("");
    setCategory("Todos");
    setProductType("Todos");
    setSort("reco");
    setSelectedSizes([]);
    setUserPriceMin(null);
    setUserPriceMax(null);
  }

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (query.trim().length > 0) n++;
    if (category !== "Todos") n++;
    if (productType !== "Todos") n++;
    if (selectedSizes.length > 0) n++;
    if (userPriceMin !== null || userPriceMax !== null) n++;
    return n;
  }, [query, category, productType, selectedSizes.length, userPriceMin, userPriceMax]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = Math.min(priceMin, priceMax);
    const max = Math.max(priceMin, priceMax);

    let list = PRODUCTS.filter((p) => {
      const matchQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);

      const matchCat = category === "Todos" || p.category === category;
      const matchType = productType === "Todos" || p.productType === productType;
      const matchSizes =
        selectedSizes.length === 0 ||
        (p.sizes ?? []).some((s) => selectedSizes.includes(s));
      const matchPrice = p.price >= min && p.price <= max;

      return matchQuery && matchCat && matchType && matchSizes && matchPrice;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name_asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [PRODUCTS, query, category, productType, selectedSizes, priceMin, priceMax, sort]);

  if (source === "loading") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-black/60">Cargando colección…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* HERO BANNER ESTILO JS CONCEPT */}
      <section className="mb-6 rounded-[32px] border border-black/5 bg-[#F5F1EA] p-6 md:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-black md:text-4xl">
          JS CONCEPT — <br className="sm:hidden" />
          Tu Selección de Vida
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/70 md:text-base">
          Explora nuestra cuidada selección de moda casual, tecnología de vanguardia,
          y esenciales para tu día a día. Calidad curada para elevar tu estilo personal.
        </p>

        <button
          onClick={() => {
            const el = document.getElementById("catalog-products");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-5 inline-flex items-center rounded-full bg-[#374231] px-6 py-3 text-xs font-semibold tracking-wide text-white transition hover:bg-[#2A3325]"
        >
          Explorar la Colección
        </button>
      </section>

      {/* BUSCADOR */}
      <section className="mb-5 space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 text-black/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            placeholder="Buscar productos, marcas y tendencias…"
          />
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            FILTROS {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
          </button>

          <p className="text-xs font-medium text-black/60">
            {filtered.length} resultados
          </p>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="reco">ORDENAR POR: Recomendados</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name_asc">Nombre: A-Z</option>
          </select>
        </div>
      </section>

      {/* LAYOUT PRINCIPAL */}
      <section id="catalog-products" className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FiltersContent
              category={category}
              onCategoryChange={setCategory}
              productTypes={productTypes}
              productType={productType}
              onProductTypeChange={setProductType}
              sizes={sizes}
              selectedSizes={selectedSizes}
              onToggleSize={toggleSize}
              priceMin={priceMin}
              priceMax={priceMax}
              onPriceMinChange={setUserPriceMin}
              onPriceMaxChange={setUserPriceMax}
              minBound={minBound}
              maxBound={maxBound}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>

          {filtered.length === 0 && <EmptyState onClear={clearFilters} />}
        </div>
      </section>

      {/* DRAWER MÓVIL */}
      <MobileFiltersDrawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <FiltersContent
          category={category}
          onCategoryChange={setCategory}
          productTypes={productTypes}
          productType={productType}
          onProductTypeChange={setProductType}
          sizes={sizes}
          selectedSizes={selectedSizes}
          onToggleSize={toggleSize}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={setUserPriceMin}
          onPriceMaxChange={setUserPriceMax}
          minBound={minBound}
          maxBound={maxBound}
          onClear={clearFilters}
        />
      </MobileFiltersDrawer>
    </main>
  );
}