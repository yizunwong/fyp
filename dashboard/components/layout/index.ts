export { default as AppLayout } from "./AppLayout";
export {
  AppLayoutProvider,
  useAppLayoutContext,
  useAppLayout,
  type AppLayoutMeta,
  type Breadcrumb,
  type MobileLayoutMeta,
  type AppRole,
} from "./AppLayoutContext";

// Re-export role-specific layouts
export { default as FarmerLayout, FarmerLayoutProvider } from "./FarmerLayout";
export { default as AgencyLayout, AgencyLayoutProvider } from "./AgencyLayout";
export {
  default as RetailerLayout,
  RetailerLayoutProvider,
} from "./RetailerLayout";

