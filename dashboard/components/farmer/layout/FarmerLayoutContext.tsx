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

export interface FarmerBreadcrumb {
  label: string;
  href?: string;
}

export interface FarmerMobileLayoutMeta {
  header?: ReactNode;
  headerPlacement?: "inside" | "outside";
  floatingAction?: ReactNode;
  hideBottomNav?: boolean;
  disableScroll?: boolean;
  contentContainerStyle?: ViewStyle;
  backgroundClassName?: string;
}

export interface FarmerLayoutMeta {
  title: string;
  subtitle?: string;
  breadcrumbs?: FarmerBreadcrumb[];
  rightHeaderButton?: ReactNode;
  contentClassName?: string;
  notifications?: Notification[];
  onMarkAllRead?: () => void;
  onNotificationPress?: (notification: Notification) => void;
  farmerName?: string;
  farmerLocation?: string;
  mobile?: FarmerMobileLayoutMeta;
}

interface FarmerLayoutContextValue {
  meta: FarmerLayoutMeta;
  setMeta: (next: FarmerLayoutMeta) => void;
  updateMeta: (next: Partial<FarmerLayoutMeta>) => void;
  resetMeta: () => void;
}

const DEFAULT_MOBILE_META: FarmerMobileLayoutMeta = {
  header: undefined,
  headerPlacement: "inside",
  floatingAction: undefined,
  hideBottomNav: false,
  disableScroll: false,
  contentContainerStyle: undefined,
  backgroundClassName: "bg-gray-50",
};

const DEFAULT_META: FarmerLayoutMeta = {
  title: "Farmer Dashboard",
  subtitle: "Monitor your farms, produce, and subsidies",
  breadcrumbs: undefined,
  rightHeaderButton: undefined,
  contentClassName: "",
  notifications: undefined,
  onMarkAllRead: undefined,
  onNotificationPress: undefined,
  farmerName: "John Farmer",
  farmerLocation: "Northern Region",
  mobile: DEFAULT_MOBILE_META,
};

function mergeMobileMeta(
  incoming?: FarmerMobileLayoutMeta
): FarmerMobileLayoutMeta {
  if (!incoming) {
    return { ...DEFAULT_MOBILE_META };
  }

  return {
    ...DEFAULT_MOBILE_META,
    ...incoming,
  };
}

const FarmerLayoutContext = createContext<FarmerLayoutContextValue | null>(
  null
);

export function FarmerLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [meta, setMetaState] = useState<FarmerLayoutMeta>({
    ...DEFAULT_META,
    mobile: mergeMobileMeta(),
  });

  const setMeta = useCallback((next: FarmerLayoutMeta) => {
    setMetaState({
      ...DEFAULT_META,
      ...next,
      mobile: mergeMobileMeta(next.mobile),
    });
  }, []);

  const updateMeta = useCallback((next: Partial<FarmerLayoutMeta>) => {
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
    <FarmerLayoutContext.Provider value={value}>
      {children}
    </FarmerLayoutContext.Provider>
  );
}

export function useFarmerLayoutContext(): FarmerLayoutContextValue {
  const context = useContext(FarmerLayoutContext);
  if (!context) {
    throw new Error(
      "useFarmerLayoutContext must be used within a FarmerLayoutProvider"
    );
  }
  return context;
}

export function useFarmerLayout(meta: Partial<FarmerLayoutMeta>): void {
  const { updateMeta, resetMeta } = useFarmerLayoutContext();

  useEffect(() => {
    updateMeta(meta);
  }, [meta, updateMeta]);

  useEffect(() => {
    return () => {
      resetMeta();
    };
  }, [resetMeta]);
}
