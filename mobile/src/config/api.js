import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * URL API Laravel.
 * Téléphone physique : EXPO_PUBLIC_API_URL doit pointer vers le PC (pas localhost).
 * VirtualBox : IP du PC hôte + redirection port 8080 (voir mobile/README.md).
 */
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const isPhysicalDevice = Constants.isDevice;

  if (!isPhysicalDevice && Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }

  if (!isPhysicalDevice) {
    return 'http://localhost:8080/api/v1';
  }

  // Téléphone réel sans variable d'env : valeur à configurer via ./start.sh
  return 'http://192.168.1.1:8080/api/v1';
}

export const API_URL = resolveApiUrl();

export const PINK = '#FF4D94';
