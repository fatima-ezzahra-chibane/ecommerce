/**
 * Bus toast unique pour toute l'app.
 * Évite les doublons (intercepteur API + showToast manuel sur la même action).
 */
let handler = null;
let lastKey = '';
let lastAt = 0;

const DEDUP_MS = 2000;

export function setToastHandler(fn) {
  handler = fn;
}

export function notifyToast(message, type = 'success') {
  if (!message || !handler) return;

  const key = `${type}::${String(message).trim()}`;
  const now = Date.now();
  if (key === lastKey && now - lastAt < DEDUP_MS) {
    return;
  }

  lastKey = key;
  lastAt = now;
  handler(message, type);
}
