import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
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

export function Header({ onSelectCategory }: { onSelectCategory?: (cat: string) => void }) {
  const items = useCartStore((s) => s.items);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  // ✅ Corregido con tipos explícitos para evitar el error TS7006 y TS2349
  const count = Array.isArray(items)
    ? items.reduce((acc: number, item: { quantity: number }) => acc + (item.quantity || 1), 0)
    : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#F7F4EE]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-normal tracking-tighter text-black/80">
            JS
          </span>
          <span className="text-base font-bold tracking-tight text-black">
            JS CONCEPT
          </span>
        </Link>

        {/* BOTÓN CARRITO */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative rounded-2xl border border-black/10 bg-white p-2.5 hover:bg-black/5"
          aria-label="Abrir carrito"
        >
          <ShoppingBag className="h-5 w-5 text-black" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#394432] text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* CHIPS DE NAVEGACIÓN RÁPIDA */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2 pt-1">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => onSelectCategory?.(cat.value)}
            className="shrink-0 rounded-full border border-black/10 bg-white px-3.5 py-1 text-[11px] font-semibold tracking-wider text-black/80 hover:bg-black/5"
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
}