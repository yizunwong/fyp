import { ReactNode } from "react";
import { Home, Settings, Shield, Users } from "lucide-react-native";
import AppLayoutComponent, { type NavigationItem } from "./AppLayout";
import { AppLayoutProvider } from "./AppLayoutContext";

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard/admin",
    icon: Home,
  },
  {
    id: "users",
    label: "User Management",
    route: "/dashboard/admin/users",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/admin/settings",
    icon: Settings,
  },
];

function resolveActiveTab(pathname: string): string {
  if (pathname.includes("/users")) return "users";
  if (pathname.includes("/settings")) return "settings";
  return "dashboard";
}

const ADMIN_BRANDING = {
  name: "HarvestChain",
  icon: Shield,
  iconBgColor: "#7c3aed",
  iconColor: "#ffffff",
  portalLabel: "Admin Portal",
  mobileHeaderGradient: ["#7c3aed", "#6d28d9"] as [string, string],
  activeColor: "#7c3aed",
  activeBgColor: "bg-purple-50",
};

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  return <AppLayoutProvider>{children}</AppLayoutProvider>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayoutComponent
      role="admin"
      navigationItems={NAVIGATION_ITEMS}
      resolveActiveTab={resolveActiveTab}
      branding={ADMIN_BRANDING}
    >
      {children}
    </AppLayoutComponent>
  );
}
