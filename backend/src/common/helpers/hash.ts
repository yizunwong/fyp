import { JsonValue } from '@prisma/client/runtime/library';
import * as crypto from 'crypto';

/**
 * Strictly typed structure for produce hashing.
 * Optional fields like certifications can be added later safely.
 */
export interface ProduceHashInput {
  batchId: string;
  name: string;
  harvestDate: string | Date;
  farmId: string;
  certifications?: JsonValue;
}

/**
 * Compute a deterministic SHA256 hash for produce data.
 * Ensures identical output across create + verify stages.
 */
export function computeProduceHash(data: ProduceHashInput): string {
  // ✅ Canonicalize only fields that matter
  const canonical: Record<keyof ProduceHashInput, string> = {
    batchId: data.batchId,
    name: data.name,
    harvestDate: formatDate(data.harvestDate),
    farmId: data.farmId,
    certifications: JSON.stringify(data.certifications ?? null),
  };

  // ✅ Sort keys alphabetically for stable JSON order
  const ordered = Object.keys(canonical)
    .sort()
    .reduce<Record<string, string>>((obj, key) => {
      obj[key] = canonical[key as keyof ProduceHashInput];
      return obj;
    }, {});

  const jsonString = JSON.stringify(ordered);
  return crypto.createHash('sha256').update(jsonString, 'utf8').digest('hex');
}

/**
 * Normalize all date formats to YYYY-MM-DD (for consistency).
 * Includes safety checks for invalid or null values.
 */
function formatDate(dateValue: string | Date): string {
  if (!dateValue) {
    throw new Error('harvestDate is missing or invalid.');
  }

  let date: Date;

  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: ${dateValue}`);
    }
    date = parsed;
  } else {
    date = dateValue;
  }

  return date.toISOString().split('T')[0];
}
