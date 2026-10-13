import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

let authExpiredHandler = null;

export function setAuthExpiredHandler(fn) {
  authExpiredHandler = fn;
}

/** Token expiré ou révoqué (désactivation, nouveau mot de passe) : fin de session côté app. */
export async function notifyAuthExpired() {
  await AsyncStorage.removeItem('token');
  authExpiredHandler?.();
}

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData : ne pas forcer application/json (sinon la photo n'est pas envoyée)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      await notifyAuthExpired();
    }
    return Promise.reject(error);
  }
);

export default api;
