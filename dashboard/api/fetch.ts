/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api-client/custom-fetcher.ts

interface FetcherProps {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: any;
  signal?: AbortSignal;
  params?: Record<string, string | number>;
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

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${url}${query}`, {
    method,
    headers: isFormData
      ? undefined // ✅ Let browser set Content-Type with boundary
      : {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    signal,
    credentials: "include",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Error:", res.status, errorBody);
    throw new Error(errorBody || "API error");
  }

  return res.json();
};
