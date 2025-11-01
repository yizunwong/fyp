import { useVerifyControllerVerifyBatch } from "@/api";
import { parseError } from "@/utils/format-error";

export function useVerifyBatchQuery(batchId: string) {
  const query = useVerifyControllerVerifyBatch(batchId);

  return {
    ...query,
    error: query.error ? parseError(query.error) : null,
  };
}
