/**
 * Generate a unique batch ID for produce.
 * Format: BTH-{timestamp}-{random}
 * Example: BTH-LXK9Z-123456
 */
export function generateBatchId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `BTH-${timestamp}-${random}`;
}
