import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ViewStyle } from "react-native";
import type { Notification } from "@/components/ui/NotificationDrawer";

export type AppRole = "farmer" | "agency" | "retailer" | "admin";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface MobileLayoutMeta {
  header?: ReactNode;
  headerPlacement?: "inside" | "outside";
  floatingAction?: ReactNode;
  hideBottomNav?: boolean;
  disableScroll?: boolean;
  contentContainerStyle?: ViewStyle;
  backgroundClassName?: string;
}

export interface AppLayoutMeta {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  rightHeaderButton?: ReactNode;
  contentClassName?: string;
  notifications?: Notification[];
  onMarkAllRead?: () => void;
  onNotificationPress?: (notification: Notification) => void;
  userDisplayName?: string;
  userDisplaySubtext?: string;
  mobile?: MobileLayoutMeta;
  // Backward compatibility fields
  farmerName?: string;
  farmerLocation?: string;
  officerName?: string;
  officerDepartment?: string;
}

interface AppLayoutContextValue {
  meta: AppLayoutMeta;
  setMeta: (next: AppLayoutMeta) => void;
  updateMeta: (next: Partial<AppLayoutMeta>) => void;
  resetMeta: () => void;
}

const DEFAULT_MOBILE_META: MobileLayoutMeta = {
  header: undefined,
  headerPlacement: "inside",
  floatingAction: undefined,
  hideBottomNav: false,
  disableScroll: false,
  contentContainerStyle: undefined,
  backgroundClassName: "bg-gray-50",
};

const DEFAULT_META: AppLayoutMeta = {
  title: "Dashboard",
  subtitle: undefined,
  breadcrumbs: undefined,
  rightHeaderButton: undefined,
  contentClassName: "",
  notifications: undefined,
  onMarkAllRead: undefined,
  onNotificationPress: undefined,
  userDisplayName: undefined,
  userDisplaySubtext: undefined,
  mobile: DEFAULT_MOBILE_META,
};

function mergeMobileMeta(incoming?: MobileLayoutMeta): MobileLayoutMeta {
  if (!incoming) {
    return { ...DEFAULT_MOBILE_META };
  }

  return {
    ...DEFAULT_MOBILE_META,
    ...incoming,
  };
}

const AppLayoutContext = createContext<AppLayoutContextValue | null>(null);

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [meta, setMetaState] = useState<AppLayoutMeta>({
    ...DEFAULT_META,
    mobile: mergeMobileMeta(),
  });

  const setMeta = useCallback((next: AppLayoutMeta) => {
    setMetaState({
      ...DEFAULT_META,
      ...next,
      mobile: mergeMobileMeta(next.mobile),
    });
  }, []);

  const updateMeta = useCallback((next: Partial<AppLayoutMeta>) => {
    setMetaState((prev) => ({
      ...prev,
      ...next,
      mobile: mergeMobileMeta({
        ...prev.mobile,
        ...next.mobile,
      }),
    }));
  }, []);

  const resetMeta = useCallback(() => {
    setMetaState({
      ...DEFAULT_META,
      mobile: mergeMobileMeta(),
    });
  }, []);

  const value = useMemo(
    () => ({
      meta,
      setMeta,
      updateMeta,
      resetMeta,
    }),
    [meta, resetMeta, setMeta, updateMeta]
  );

  return (
    <AppLayoutContext.Provider value={value}>
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayoutContext(): AppLayoutContextValue {
  const context = useContext(AppLayoutContext);
  if (!context) {
    throw new Error(
      "useAppLayoutContext must be used within an AppLayoutProvider"
    );
  }
  return context;
}

export function useAppLayout(meta: Partial<AppLayoutMeta>): void {
  const { updateMeta, resetMeta } = useAppLayoutContext();

  useEffect(() => {
    updateMeta(meta);
  }, [meta, updateMeta]);

  useEffect(() => {
    return () => {
      resetMeta();
    };
  }, [resetMeta]);
}
