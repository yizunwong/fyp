import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Notification } from "@/components/ui/NotificationDrawer";

export interface AgencyLayoutMeta {
  title: string;
  subtitle?: string;
  notifications?: Notification[];
  onMarkAllRead?: () => void;
  onNotificationPress?: (notification: Notification) => void;
  officerName?: string;
  officerDepartment?: string;
  rightHeaderButton?: ReactNode;
}

interface AgencyLayoutContextValue {
  meta: AgencyLayoutMeta;
  setMeta: (next: AgencyLayoutMeta) => void;
  updateMeta: (next: Partial<AgencyLayoutMeta>) => void;
  resetMeta: () => void;
}

const DEFAULT_META: AgencyLayoutMeta = {
  title: "Agency Dashboard",
  subtitle: "Monitor registrations, programs, and approvals",
  notifications: [
    {
      id: 1,
      title: "New Farm Registration",
      message: "Padi Hijau Enterprise requires verification",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 2,
      title: "Critical Weather Alert",
      message: "Flood warning in Kuala Terengganu",
      time: "2 hours ago",
      unread: true,
    },
  ],
  onMarkAllRead: undefined,
  onNotificationPress: undefined,
  officerName: "Ahmad Ismail",
  officerDepartment: "Agriculture Department",
  rightHeaderButton: undefined,
};

const AgencyLayoutContext = createContext<AgencyLayoutContextValue | null>(
  null
);

function shallowEqualMeta(a: AgencyLayoutMeta, b: AgencyLayoutMeta): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<
    keyof AgencyLayoutMeta
  >;

  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function AgencyLayoutProvider({ children }: { children: ReactNode }) {
  const [meta, setMetaState] = useState<AgencyLayoutMeta>(DEFAULT_META);

  const setMeta = useCallback((next: AgencyLayoutMeta) => {
    setMetaState((prev) => {
      const merged = { ...DEFAULT_META, ...next };
      return shallowEqualMeta(prev, merged) ? prev : merged;
    });
  }, []);

  const updateMeta = useCallback((next: Partial<AgencyLayoutMeta>) => {
    setMetaState((prev) => {
      const merged = { ...prev, ...next };
      return shallowEqualMeta(prev, merged) ? prev : merged;
    });
  }, []);

  const resetMeta = useCallback(() => {
    setMetaState(DEFAULT_META);
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
    <AgencyLayoutContext.Provider value={value}>
      {children}
    </AgencyLayoutContext.Provider>
  );
}

export function useAgencyLayoutContext(): AgencyLayoutContextValue {
  const context = useContext(AgencyLayoutContext);
  if (!context) {
    throw new Error(
      "useAgencyLayoutContext must be used within an AgencyLayoutProvider"
    );
  }
  return context;
}

export function useAgencyLayout(meta: Partial<AgencyLayoutMeta>): void {
  const { updateMeta, resetMeta } = useAgencyLayoutContext();

  useEffect(() => {
    updateMeta(meta);
  }, [meta, updateMeta]);

  useEffect(() => resetMeta, [resetMeta]);
}
