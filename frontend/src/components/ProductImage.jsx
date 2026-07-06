import { useState } from 'react';

const FALLBACK = 'https://picsum.photos/seed/vivid-product/400/400';

function isLikelyImageUrl(src) {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim().toLowerCase();
  if (s.startsWith('data:image/')) return true;
  if (s.includes('/@vite/') || s.includes('__vite') || s.includes('[plugin:')) return false;
  if (s.startsWith('http://localhost:5173') && !s.includes('/storage/')) return false;
  return (
    /\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(s)
    || s.includes('/storage/')
    || s.includes('picsum.photos')
    || s.includes('images.unsplash')
    || s.includes('placehold')
  );
}

/**
 * Image produit — même rendu partout (upload admin, URL externe, placeholder).
 */
export default function ProductImage({ src, alt, className = '', imgClassName = '' }) {
  const initial = isLikelyImageUrl(src) ? src : FALLBACK;
  const [current, setCurrent] = useState(initial);

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
