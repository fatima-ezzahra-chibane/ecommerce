import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

function formatApiError(data) {
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first && !String(first).startsWith('validation.')) return first;
  }
  const key = data?.message;
  const known = {
    'validation.uploaded': 'Impossible d\'envoyer l\'image. Choisissez une photo JPEG/PNG (max 4 Mo).',
    'validation.image': 'Le fichier doit être une image.',
    'validation.mimes': 'Format accepté : JPEG, PNG ou WebP.',
    'validation.max.file': 'Image trop lourde (max 4 Mo).',
  };
  if (key && known[key]) return known[key];
  if (key && !String(key).startsWith('validation.')) return key;
  return 'Erreur lors de l\'envoi de l\'image';
}

/** Prépare la photo pour l'upload (copie vers cache avec chemin file:// stable). */
export async function prepareUploadFile(asset) {
  const mimeType = asset.mimeType || 'image/jpeg';
  const isPng = mimeType.includes('png');
  const ext = isPng ? 'png' : 'jpg';
  const type = isPng ? 'image/png' : 'image/jpeg';
  const rawName = asset.fileName || `upload-${Date.now()}.${ext}`;
  const fileName = rawName.includes('.') ? rawName : `${rawName}.${ext}`;

  let uri = asset.uri;
  const dest = `${FileSystem.cacheDirectory}upload-${Date.now()}.${ext}`;

  if (Platform.OS === 'android' || uri.startsWith('content://') || uri.startsWith('ph://')) {
    await FileSystem.copyAsync({ from: uri, to: dest });
    uri = dest;
  } else if (!uri.startsWith('file://')) {
    uri = `file://${uri}`;
  }

  return { uri, name: fileName, type };
}

/** Upload multipart fiable via expo-file-system (Android/iOS). */
export async function postMultipart(path, formData, options = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const fileField = options.fileField || 'image';
  const file = options.file;

  if (file?.uri) {
    const parameters = { ...(options.parameters || {}) };
    if (formData?._parts) {
      for (const [key, value] of formData._parts) {
        if (key !== fileField && typeof value === 'string') {
          parameters[key] = value;
        }
      }
    }

    const result = await FileSystem.uploadAsync(`${API_URL}${path}`, file.uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: fileField,
      mimeType: file.type || 'image/jpeg',
      parameters,
      headers,
    });

    let data;
    try {
      data = JSON.parse(result.body);
    } catch {
      data = { message: 'Réponse serveur invalide' };
    }

    if (result.status < 200 || result.status >= 300) {
      const error = new Error(formatApiError(data));
      error.response = { data, status: result.status };
      throw error;
    }

    return { data, status: result.status };
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: 'Réponse serveur invalide' };
  }

  if (!response.ok) {
    const error = new Error(formatApiError(data));
    error.response = { data, status: response.status };
    throw error;
  }

  return { data, status: response.status };
}
