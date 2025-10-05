export function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
