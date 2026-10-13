import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { setToastHandler } from '../utils/toastBus';

const onError = (error) => api.interceptors.response.handlers[0].rejected(error);

describe('intercepteur API', () => {
  const toast = vi.fn();
  const expired = vi.fn();

  beforeEach(() => {
    toast.mockClear();
    expired.mockClear();
    setToastHandler(toast);
    localStorage.setItem('token', 'abc');
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  });

  it('termine la session si un token est refusé (401)', async () => {
    const error = { config: { headers: { Authorization: 'Bearer abc' } }, response: { status: 401, data: {} } };

    await expect(onError(error)).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Session expirée. Veuillez vous reconnecter.', 'error');
  });

  it('garde le token pour un 401 sans authentification (mauvais identifiants)', async () => {
    const error = { config: { headers: {} }, response: { status: 401, data: { message: 'Identifiants invalides.' } } };

    await expect(onError(error)).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBe('abc');
    expect(expired).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Identifiants invalides.', 'error');
  });

  it('laisse la page gérer l’erreur si skipErrorToast est demandé', async () => {
    const error = { config: { headers: {}, skipErrorToast: true }, response: { status: 422, data: { message: 'Identifiants invalides.' } } };

    await expect(onError(error)).rejects.toBe(error);
    expect(toast).not.toHaveBeenCalled();
  });

  it('affiche la première erreur de validation (422)', async () => {
    const error = { config: { headers: {} }, response: { status: 422, data: { errors: { quantity: ['Stock insuffisant.'] } } } };

    await expect(onError(error)).rejects.toBe(error);
    expect(toast).toHaveBeenCalledWith('Stock insuffisant.', 'error');
  });
});
