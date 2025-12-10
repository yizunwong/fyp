// Re-export from shared layout context for backward compatibility
import type {
  AppLayoutMeta,
  Breadcrumb,
  MobileLayoutMeta,
} from "@/components/layout/AppLayoutContext";

export {
  useAppLayoutContext as useFarmerLayoutContext,
  useAppLayout as useFarmerLayout,
} from "@/components/layout/AppLayoutContext";

// Re-export provider from new layout file
export { FarmerLayoutProvider } from "@/components/layout/FarmerLayout";

// Type aliases for backward compatibility
export type FarmerLayoutMeta = AppLayoutMeta & {
  farmerName?: string;
  farmerLocation?: string;
};

export type FarmerBreadcrumb = Breadcrumb;
export type FarmerMobileLayoutMeta = MobileLayoutMeta;
