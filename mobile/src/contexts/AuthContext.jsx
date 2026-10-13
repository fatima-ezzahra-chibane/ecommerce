import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';
import { setAuthExpiredHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  userRef.current = user;

  useEffect(() => {
    setAuthExpiredHandler(() => {
      if (!userRef.current) return;
      setUser(null);
      Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
    });
    return () => setAuthExpiredHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.me();
        setUser(data.user);
      } catch {
        // 401 : token supprimé par l'intercepteur ; erreur réseau : on le garde pour le prochain lancement
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    setUser(null);
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem('token');
  };

  const refreshUser = useCallback(async () => {
    const { data } = await authService.me();
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
