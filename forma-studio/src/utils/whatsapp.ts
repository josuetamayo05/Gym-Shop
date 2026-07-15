import type { CartItem } from "../types";
import { formatMoney } from "./money";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function generateOrderId(prefix = "GS") {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${y}${m}${day}-${rand}`;
}

export function buildWhatsAppMessagePro(items: CartItem[], opts?: { note?: string; orderId?: string }) {
  const orderId = opts?.orderId ?? generateOrderId("GS");
  const dateStr = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const lines: string[] = [];
  lines.push(`*GYM STUDIO* — Pedido`);
  lines.push(`ID: *${orderId}*`);
  lines.push(`Fecha: ${dateStr}`);
  lines.push("");
  lines.push("*Productos*");

  items.forEach((it) => {
    const subtotal = it.product.price * it.quantity;
    lines.push(
      `• ${it.product.name} (Talla: ${it.size}) x${it.quantity} — ${formatMoney(subtotal)}`
    );
  });

  const total = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  lines.push("");
  lines.push(`*TOTAL: ${formatMoney(total)}*`);

  const note = (opts?.note ?? "").trim();
  if (note) {
    lines.push("");
    lines.push("*Nota*");
    lines.push(note);
  }

  lines.push("");
  lines.push("¿Me confirmas disponibilidad y entrega?");

  return lines.join("\n");
}

export function buildWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}