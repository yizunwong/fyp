import { ComponentType } from "react";

import { Notification as DrawerNotification } from "@/components/ui/NotificationDrawer";

export type Notification = DrawerNotification;

export type KPIItem = {
  label: string;
  value: string;
  icon: ComponentType<{ color: string; size: number }>;
  color: string;
};

export type RecentProduceItem = {
  id: number | string;
  name: string;
  batch?: string | null;
  quantity: string;
  status: string;
};

export type SubsidyStatusItem = {
  id: number | string;
  program?: string | null;
  amount: string;
  status: string;
};

export type TimelineItem = {
  status: string;
  date: string;
  time: string;
  verified: boolean;
};
