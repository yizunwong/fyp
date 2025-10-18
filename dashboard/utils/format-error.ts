export function parseError(err: unknown): string {
  if (!err) return "Unexpected error occurred";

  if ((err as any)?.response?.data) {
    const data = (err as any).response.data;
    if (typeof data === "string") return data;
    if (Array.isArray(data?.message))
      return data.message[0] || "Unexpected error occurred";
    if (typeof data?.message === "string") return data.message;
  }

  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);

      if (Array.isArray(parsed))
        return parsed[0] || "Unexpected error occurred";
      if (Array.isArray(parsed?.message))
        return parsed.message[0] || "Unexpected error occurred";
      if (typeof parsed?.message === "string") return parsed.message;

      return "Unexpected error occurred";
    } catch {
      return err.message || "Unexpected error occurred";
    }
  }

  return "Unexpected error occurred";
}
