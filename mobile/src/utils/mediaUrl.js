import { API_URL } from '../config/api';

const API_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

/** Corrige les URLs storage (localhost) pour le téléphone. */
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, API_BASE);
  }
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}
