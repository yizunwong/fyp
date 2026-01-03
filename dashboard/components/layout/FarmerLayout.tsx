import { ReactNode } from "react";
import {
  DollarSign,
  Home,
  Package,
  Settings,
  Warehouse,
  Sprout,
} from "lucide-react-native";
import AppLayoutComponent, { type NavigationItem } from "./AppLayout";
import { AppLayoutProvider } from "./AppLayoutContext";

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard/farmer",
    icon: Home,
  },
  {
    id: "farms",
    label: "Farms",
    route: "/dashboard/farmer/farms",
    icon: Warehouse,
  },
  {
    id: "produce",
    label: "Produce",
    route: "/dashboard/farmer/produce",
    icon: Package,
  },
  {
    id: "subsidy",
    label: "Subsidy",
    route: "/dashboard/farmer/subsidy",
    icon: DollarSign,
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/farmer/settings",
    icon: Settings,
  },
];

function resolveActiveTab(pathname: string): string {
  if (
    pathname.includes("/farms") ||
    pathname.includes("/register-farm") ||
    pathname.includes("/farm/")
  ) {
    return "farms";
  }

  if (pathname.includes("/produce") || pathname.includes("/add-produce")) {
    return "produce";
  }

  if (pathname.includes("/subsidy")) {
    return "subsidy";
  }

  if (pathname.includes("/settings")) {
    return "settings";
  }

  return "dashboard";
}

const FARMER_BRANDING = {
  name: "HarvestChain",
  icon: Sprout,
  iconBgColor: "#10b981",
  iconColor: "#ffffff",
  portalLabel: "Farmer Portal",
  mobileHeaderGradient: ["#22c55e", "#059669"] as [string, string],
  activeColor: "#059669",
  activeBgColor: "bg-emerald-50",
};

export function FarmerLayoutProvider({ children }: { children: ReactNode }) {
  return <AppLayoutProvider>{children}</AppLayoutProvider>;
}

export default function FarmerLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayoutComponent
      role="farmer"
      navigationItems={NAVIGATION_ITEMS}
      resolveActiveTab={resolveActiveTab}
      branding={FARMER_BRANDING}
    >
      {children}
    </AppLayoutComponent>
  );
}
