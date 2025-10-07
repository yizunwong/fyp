export function parseError(err: unknown): string | null {
  if (!err) return null;

  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);

      // If the parsed message is an array, return the first item
      if (Array.isArray(parsed)) {
        return parsed[0] || "Unexpected error occurred";
      }

      // If there's a message array inside an object
      if (Array.isArray(parsed?.message)) {
        return parsed.message[0] || "Unexpected error occurred";
      }

      // If it's a single message string
      if (typeof parsed?.message === "string") {
        return parsed.message;
      }

      return "Unexpected error occurred";
    } catch {
      // If it's not JSON, return the raw error message
      return err.message || "Unexpected error occurred";
    }
  }

  return "Unknown error";
}
