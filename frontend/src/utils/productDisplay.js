/** Promo visuelle démo (~25 % sur 1 produit sur 3) */
export function getPromo(product, index = 0) {
  const show = (product.id + index) % 3 === 0;
  if (!show) return null;
  const price = Number(product.price);
  const original = Math.round(price * 1.333 * 100) / 100;
  const percent = Math.round((1 - price / original) * 100);
  return { original, percent: percent > 0 ? percent : 25 };
}
