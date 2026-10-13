import axios from 'axios';
import { notifyToast } from '../utils/toastBus';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.skipGlobalToast) {
      return response;
    }

    const method = response.config.method?.toUpperCase();
    const msg = response.data?.message;
    if (msg && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      notifyToast(msg, 'success');
    }
    return response;
  },
  (error) => {
    // Token expiré ou révoqué (désactivation, nouveau mot de passe) : on termine la session côté client
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
      notifyToast('Session expirée. Veuillez vous reconnecter.', 'error');
      return Promise.reject(error);
    }

    if (!error.config?.skipGlobalToast && !error.config?.skipErrorToast) {
      const data = error.response?.data;
      let message = data?.message;
      if (!message && data?.errors) {
        const first = Object.values(data.errors)[0];
        message = Array.isArray(first) ? first[0] : first;
      }
      if (!message) {
        const status = error.response?.status;
        if (status === 401) message = 'Non authentifié. Veuillez vous connecter.';
        else if (status === 403) message = 'Accès interdit.';
        else if (status === 404) message = 'Ressource introuvable.';
        else if (status >= 500) message = 'Erreur serveur. Veuillez réessayer.';
        else message = 'Une erreur est survenue.';
      }
      if (message) {
        notifyToast(message, 'error');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
