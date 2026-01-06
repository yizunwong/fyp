import {
  useNotificationControllerListNotifications,
  useNotificationControllerMarkAsRead,
  useNotificationControllerMarkAllAsRead,
  NotificationControllerListNotificationsParams,
  NotificationResponseDto,
} from "@/api";
import { parseError } from "@/utils/format-error";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

// Transform API notification to component notification format
export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}

function transformNotification(dto: NotificationResponseDto): Notification {
  return {
    id: parseInt(dto.id, 10) || 0,
    title: dto.title,
    message: dto.message,
    time: formatTimeAgo(dto.createdAt),
    unread: !dto.read,
  };
}

export function useNotificationsQuery(
  params?: NotificationControllerListNotificationsParams
) {
  const query = useNotificationControllerListNotifications(params);
  const notifications = useMemo(
    () => query.data?.data?.map(transformNotification) ?? [],
    [query.data?.data]
  );
  const parsedError = query.error ? parseError(query.error) : undefined;

  return {
    ...query,
    notifications,
    error: parsedError,
  };
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();
  const mutation = useNotificationControllerMarkAsRead({
    mutation: {
      onSuccess: () => {
        // Invalidate notifications query to refetch
        queryClient.invalidateQueries({
          queryKey: ["/notifications"],
        });
      },
    },
  });

  return {
    ...mutation,
    markAsRead: (id: string) => mutation.mutateAsync({ id }),
    error: mutation.error ? parseError(mutation.error) : undefined,
  };
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();
  const mutation = useNotificationControllerMarkAllAsRead({
    mutation: {
      onSuccess: () => {
        // Invalidate notifications query to refetch
        queryClient.invalidateQueries({
          queryKey: ["/notifications"],
        });
      },
    },
  });

  return {
    ...mutation,
    markAllAsRead: () => mutation.mutateAsync(),
    error: mutation.error ? parseError(mutation.error) : undefined,
  };
}

export default function useNotification(
  params?: NotificationControllerListNotificationsParams
) {
  const notificationsQuery = useNotificationsQuery(params);
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  return {
    notifications: notificationsQuery.notifications,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markAsReadMutation.markAsRead,
    markAllAsRead: markAllAsReadMutation.markAllAsRead,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

