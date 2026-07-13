import type { CartItem } from "../types";
import { formatMoney } from "./money";

export function buildWhatsAppMessage(items: CartItem[]) {
  const lines: string[] = [];

  lines.push("Hola! Quiero hacer un pedido:");
  lines.push("");

  items.forEach((it) => {
    const subtotal = it.product.price * it.quantity;
    lines.push(`• ${it.product.name} (Talla: ${it.size}) x${it.quantity} — ${formatMoney(subtotal)}`);
  });

  const total = items.reduce(
    (acc, it) => acc + it.product.price * it.quantity,
    0
  );

  lines.push("");
  lines.push(`Total: ${formatMoney(total)}`);
  lines.push("");
  lines.push("¿Me confirmas disponibilidad y tiempo de entrega?");

  return lines.join("\n");
}

export function buildWhatsAppLink(phone: string, message: string) {
  // const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/5350121476?text=${encodeURIComponent(message)}`;
}