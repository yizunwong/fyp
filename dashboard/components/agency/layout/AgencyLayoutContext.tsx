// Re-export from shared layout context for backward compatibility
import type { AppLayoutMeta } from "@/components/layout/AppLayoutContext";

export {
  useAppLayoutContext as useAgencyLayoutContext,
  useAppLayout as useAgencyLayout,
} from "@/components/layout/AppLayoutContext";

// Re-export provider from new layout file
export { AgencyLayoutProvider } from "@/components/layout/AgencyLayout";

// Type alias for backward compatibility
export type AgencyLayoutMeta = AppLayoutMeta & {
  officerName?: string;
  officerDepartment?: string;
};
