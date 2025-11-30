/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api-client/custom-fetcher.ts

import { Platform } from "react-native";
import {
  getToken,
  saveToken,
  saveRefreshToken,
  getRefreshToken,
} from "@/lib/auth";

interface FetcherProps {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: any;
  signal?: AbortSignal;
  params?: Record<string, string | number>;
}

function extractTokens(json: any) {
  const data = json?.data ?? json;
  const access_token = data?.access_token as string | undefined;
  const refresh_token = data?.refresh_token as string | undefined;
  return { access_token, refresh_token };
}

async function doFetch(url: string, init: RequestInit) {
  return fetch(url, init);
}

export const customFetcher = async <T = any>({
  url,
  method,
  headers,
  data,
  signal,
  params,
}: FetcherProps): Promise<T> => {
  const query = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";

  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
  const fullUrl = `${baseUrl}${url}${query}`;

  const accessToken = await getToken();
  const defaultHeaders: Record<string, string> | undefined = isFormData
    ? undefined
    : {
        "Content-Type": "application/json",
        ...(headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        "X-Client-Platform": Platform.OS as string,
      };

  const init: RequestInit = {
    method,
    headers: defaultHeaders,
    body: data
      ? isFormData
        ? (data as any)
        : JSON.stringify(data)
      : undefined,
    signal,
    credentials: "include",
  };

  let res = await doFetch(fullUrl, init);

  // Auto-refresh on 401 (access token expired)
  if (res.status === 401 && !url.endsWith("/auth/login")) {
    try {
      if (Platform.OS === "web") {
        const refreshRes = await doFetch(`${baseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "X-Client-Platform": "web" },
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const { access_token, refresh_token } = extractTokens(refreshData);
          if (access_token) await saveToken(access_token);
          if (refresh_token) await saveRefreshToken(refresh_token);
        }
      } else {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const refreshRes = await doFetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Client-Platform": Platform.OS as string,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const { access_token, refresh_token } = extractTokens(refreshData);
            if (access_token) await saveToken(access_token);
            if (refresh_token) await saveRefreshToken(refresh_token);
          }
        }
      }

      // Retry original request with updated Authorization
      const newAccess = await getToken();
      const retryHeaders = isFormData
        ? undefined
        : {
            "Content-Type": "application/json",
            ...(headers || {}),
            ...(newAccess ? { Authorization: `Bearer ${newAccess}` } : {}),
            "X-Client-Platform": Platform.OS as string,
          };
      res = await doFetch(fullUrl, { ...init, headers: retryHeaders });
    } catch (e) {
      // Swallow and let error handling below throw
    }
  }

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Error:", res.status, errorBody);
    throw new Error(errorBody || "API error");
  }

  const json = await res.json();

  // Persist tokens after login/refresh
  if (
    typeof url === "string" &&
    (url.endsWith("/auth/login") || url.endsWith("/auth/refresh"))
  ) {
    const { access_token, refresh_token } = extractTokens(json);
    if (access_token) await saveToken(access_token);
    if (refresh_token) await saveRefreshToken(refresh_token);
  }

  return json as T;
};
