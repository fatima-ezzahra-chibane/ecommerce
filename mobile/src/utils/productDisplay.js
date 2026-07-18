/** Promo réelle basée sur original_price du backend */
export function getPromo(product) {
  if (!product.original_price) return null;
  const price = Number(product.price);
  const original = Number(product.original_price);
  if (original <= price) return null;
  const percent = Math.round((1 - price / original) * 100);
  return { original, percent: percent > 0 ? percent : null };
}
