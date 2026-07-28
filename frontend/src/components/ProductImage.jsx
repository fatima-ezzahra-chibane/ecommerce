import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../utils/mediaUrl';

const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
      '<rect fill="#f1f5f9" width="400" height="400"/>' +
      '<text x="200" y="205" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="18">Image indisponible</text>' +
      '</svg>'
  );

function isLikelyImageUrl(src) {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim().toLowerCase();
  if (s.startsWith('data:image/')) return true;
  if (s.includes('/@vite/') || s.includes('__vite') || s.includes('[plugin:')) return false;
  return (
    /\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(s)
    || s.includes('/storage/')
    || s.includes('picsum.photos')
    || s.includes('images.unsplash')
    || s.includes('placehold')
  );
}

/**
 * Image produit — même rendu partout (boutique, favoris, panier, admin).
 */
export default function ProductImage({ src, alt, className = '', imgClassName = '' }) {
  const resolved = resolveMediaUrl(src);
  const initial = isLikelyImageUrl(resolved || src) ? (resolved || src) : FALLBACK;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    const next = resolveMediaUrl(src);
    setCurrent(isLikelyImageUrl(next || src) ? (next || src) : FALLBACK);
  }, [src]);

  return (
    <img
      src={current}
      alt={alt || 'Produit'}
      className={[imgClassName, className].filter(Boolean).join(' ') || 'object-contain'}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
    />
  );
}
