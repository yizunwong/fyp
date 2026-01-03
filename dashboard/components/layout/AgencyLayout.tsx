import { ReactNode } from "react";
import {
  FileCheck,
  FileText,
  Home,
  Settings,
  Shield,
  Users,
} from "lucide-react-native";
import AppLayoutComponent, { type NavigationItem } from "./AppLayout";
import { AppLayoutProvider } from "./AppLayoutContext";

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard/agency",
    icon: Home,
  },
  {
    id: "registrations",
    label: "Farm Registrations",
    route: "/dashboard/agency/registrations",
    icon: FileCheck,
  },
  {
    id: "approvals",
    label: "Subsidy Approvals",
    route: "/dashboard/agency/approvals",
    icon: FileText,
  },
  {
    id: "programs",
    label: "Program Management",
    route: "/dashboard/agency/programs",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/agency/settings",
    icon: Settings,
  },
];

function resolveActiveTab(pathname: string): string {
  if (pathname.includes("/registrations")) return "registrations";
  if (pathname.includes("/approvals")) return "approvals";
  if (pathname.includes("/weather")) return "weather";
  if (pathname.includes("/programs")) return "programs";
  if (pathname.includes("/settings")) return "settings";
  return "dashboard";
}

const AGENCY_BRANDING = {
  name: "HarvestChain",
  icon: Shield,
  iconBgColor: "#2563eb",
  iconColor: "#ffffff",
  portalLabel: "Government Portal",
  mobileHeaderGradient: ["#2563eb", "#1e40af"] as [string, string],
  activeColor: "#2563eb",
  activeBgColor: "bg-blue-50",
};

export function AgencyLayoutProvider({ children }: { children: ReactNode }) {
  return <AppLayoutProvider>{children}</AppLayoutProvider>;
}

export default function AgencyLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayoutComponent
      role="agency"
      navigationItems={NAVIGATION_ITEMS}
      resolveActiveTab={resolveActiveTab}
      branding={AGENCY_BRANDING}
    >
      {children}
    </AppLayoutComponent>
  );
}
