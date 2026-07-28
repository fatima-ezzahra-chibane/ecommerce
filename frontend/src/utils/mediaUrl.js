const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const API_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Transforme /storage/... en URL absolue (API :8080).
 * Sur le web, une URL relative pointe vers Vite :5173 et casse l'image.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const s = url.trim();
  if (!s) return null;
  if (s.startsWith('data:image/')) return s;
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return s.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, API_BASE);
  }
  return `${API_BASE}${s.startsWith('/') ? s : `/${s}`}`;
}
