export function formatPrice(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '0.00 DH';
  return `${n.toFixed(2)} DH`;
}
