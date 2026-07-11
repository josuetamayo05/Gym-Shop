export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD", // cámbialo a "ARS", "EUR", etc.
    maximumFractionDigits: 0,
  }).format(value);
}