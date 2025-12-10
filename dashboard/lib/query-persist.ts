import { Platform } from "react-native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Persister } from "@tanstack/react-query-persist-client";

// Get localStorage safely (only available on web)
function getLocalStorage(): Storage | null {
  if (Platform.OS !== "web") return null;

  try {
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage as Storage;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

// Create AsyncStorage persister for mobile (iOS/Android)
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Create localStorage persister for web (only if localStorage is available)
const localStorage = getLocalStorage();
export const localPersister: Persister | null = localStorage
  ? createAsyncStoragePersister({
      storage: localStorage,
    })
  : null;
