import { ReactNode } from "react";
import {
  Home,
  Package,
  QrCode,
  ShoppingCart,
  Star,
  Settings,
} from "lucide-react-native";
import AppLayoutComponent, { type NavigationItem } from "./AppLayout";
import { AppLayoutProvider } from "./AppLayoutContext";

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard/retailer",
    icon: Home,
  },
  {
    id: "batches",
    label: "Batches",
    route: "/dashboard/retailer/batches",
    icon: Package,
  },
  {
    id: "scan",
    label: "Scan",
    route: "/dashboard/retailer/scan",
    icon: QrCode,
  },
  {
    id: "orders",
    label: "Orders",
    route: "/dashboard/retailer/orders",
    icon: ShoppingCart,
  },
  {
    id: "ratings",
    label: "Ratings",
    route: "/dashboard/retailer/ratings",
    icon: Star,
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/retailer/settings",
    icon: Settings,
  },
];

function resolveActiveTab(pathname: string): string {
  if (pathname.includes("/batches")) return "batches";
  if (pathname.includes("/scan")) return "scan";
  if (pathname.includes("/orders")) return "orders";
  if (pathname.includes("/ratings")) return "ratings";
  if (pathname.includes("/settings")) return "settings";
  return "dashboard";
}

const RETAILER_BRANDING = {
  name: "AgriChain",
  icon: ShoppingCart,
  iconBgColor: "#f97316",
  iconColor: "#ffffff",
  portalLabel: "Retailer Portal",
  mobileHeaderGradient: ["#f97316", "#ea580c"] as [string, string],
  activeColor: "#ea580c",
  activeBgColor: "bg-orange-50",
};

export function RetailerLayoutProvider({ children }: { children: ReactNode }) {
  return <AppLayoutProvider>{children}</AppLayoutProvider>;
}

export default function RetailerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppLayoutComponent
      role="retailer"
      navigationItems={NAVIGATION_ITEMS}
      resolveActiveTab={resolveActiveTab}
      branding={RETAILER_BRANDING}
    >
      {children}
    </AppLayoutComponent>
  );
}
