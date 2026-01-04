import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// On web: use HttpOnly cookies for both access and refresh tokens (set by backend)
// On native: store both access and refresh tokens in SecureStore
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

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

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const token = await getToken();
  const headers = new Headers(init.headers as any);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const opts: RequestInit = { ...init, headers };
  if (Platform.OS === "web") {
    // Ensure cookies are included for refresh flows on web
    (opts as any).credentials = "include";
  }
  return fetch(input, opts);
}

// Native-only helpers for refresh token storage
export async function saveRefreshToken(token: string | null | undefined) {
  if (Platform.OS === "web") return; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return;
  if (!token) return;
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") return null; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return null;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken() {
  if (Platform.OS === "web") return; // cookie on web
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export const ACCESS_KEY = ACCESS_TOKEN_KEY; // legacy alias if needed
