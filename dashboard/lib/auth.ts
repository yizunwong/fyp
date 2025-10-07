import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// On web: use HttpOnly cookie for refresh; store access token in localStorage
// On native: store both access and refresh in SecureStore
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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
  if (Platform.OS === "web") return; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return null; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return null;
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === "web") return; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getToken();
  const headers = new Headers(init.headers as any);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const opts: RequestInit = { ...init, headers };
  if (Platform.OS === 'web') {
    // Ensure cookies are included for refresh flows on web
    (opts as any).credentials = 'include';
  }
  return fetch(input, opts);
}

// Native-only helpers for refresh token storage
export async function saveRefreshToken(token: string | null | undefined) {
  if (Platform.OS === 'web') return; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return;
  if (!token) return;
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return null;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken() {
  if (Platform.OS === 'web') return; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// Unified logout helper respecting platform storage/cookies
export async function logout() {
  if (Platform.OS === 'web') {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    await clearToken();
  } else {
    const refresh = await getRefreshToken();
    // Always use HTTPS in production for security
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client-Platform': Platform.OS },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    await clearToken();
    await clearRefreshToken();
  }
}

export const ACCESS_KEY = ACCESS_TOKEN_KEY; // legacy alias if needed
