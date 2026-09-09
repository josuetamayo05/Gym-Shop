import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";

const QUICK_CATEGORIES = [
  { label: "LO NUEVO", value: "Todos" },
  { label: "HOMBRE", value: "Hombre" },
  { label: "MUJER", value: "Mujer" },
  { label: "TECNOLOGÍA", value: "Tecnología" },
  { label: "SUPLEMENTOS", value: "Suplementos" },
  { label: "TENDENCIAS", value: "Tendencias" },
];

export function Header() {
  const items = useCartStore((s) => s.items);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const activeCategory = params.get("category") ?? "Todos";

  const count = Array.isArray(items)
    ? items.reduce(
        (acc: number, item: { quantity?: number }) =>
          acc + (item.quantity ?? 1),
        0
      )
    : 0;

  function handleCategoryClick(value: string) {
    if (value === "Todos") {
      navigate("/");
    } else {
      navigate(`/?category=${encodeURIComponent(value)}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FBF9F6]/95 backdrop-blur-md">
      {/* Fila superior: Logo + Carrito */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-serif text-[26px] font-normal italic leading-none tracking-tight text-black/80">
            JS
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-black">
            JS CONCEPT
          </span>
        </Link>

        {/* CARRITO — limpio sin caja */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="Abrir carrito"
        >
          <ShoppingCart className="h-[22px] w-[22px] text-black" strokeWidth={1.6} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#384232] px-1 text-[10px] font-bold leading-none text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </div>

      {/* CHIPS */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {QUICK_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.value;
          return (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.value)}
              className={
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.04em] transition active:scale-[0.98] " +
                (active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-black/[0.03]")
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}