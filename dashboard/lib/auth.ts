import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'access_token';

type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} | null;

function getWebStorage(): WebStorage {
  try {
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage as WebStorage;
    }
  } catch {}
  return null;
}

export async function saveToken(token: string) {
  // Prefer SecureStore on native; use localStorage on web
  if (Platform.OS === 'web') {
    const storage = getWebStorage();
    storage?.setItem(TOKEN_KEY, token);
    return;
  }
  // Guard for environments where SecureStore may be unavailable
  if (!(await SecureStore.isAvailableAsync())) {
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();
    return storage?.getItem(TOKEN_KEY) ?? null;
  }
  if (!(await SecureStore.isAvailableAsync())) {
    return null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();
    storage?.removeItem(TOKEN_KEY);
    return;
  }
  if (!(await SecureStore.isAvailableAsync())) {
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getToken();
  const headers = new Headers(init.headers as any);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
