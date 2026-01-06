import {
  useWeatherControllerGetWeatherAlerts,
  WeatherControllerGetWeatherAlertsParams,
  WeatherAlertResponseDto,
} from "@/api";
import { parseError } from "@/utils/format-error";
import { useMemo } from "react";

export interface WeatherAlert {
  region: string;
  severity: string;
  message: string;
  updatedAt: string;
}

function formatTimeAgo(dateString: string | Date): string {
  let date: Date;
  
  if (dateString instanceof Date) {
    date = dateString;
  } else if (typeof dateString === 'string') {
    date = new Date(dateString);
  } else {
    return "Updated recently";
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Updated recently";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Updated moments ago";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Updated ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Updated ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `Updated ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
}

function transformWeatherAlert(dto: WeatherAlertResponseDto): WeatherAlert {
  // Determine severity based on message content
  const messageLower = dto.message.toLowerCase();
  let severity = "Warning";
  
  // Critical severity - Third Category, heavy rain, thunderstorms, floods
  if (
    messageLower.includes("third category") ||
    messageLower.includes("kategori ketiga") ||
    messageLower.includes("heavy rain") ||
    messageLower.includes("hujan lebat") ||
    messageLower.includes("thunderstorms") ||
    messageLower.includes("ribut petir") ||
    messageLower.includes("flood") ||
    messageLower.includes("banjir") ||
    messageLower.includes("sea level rise") ||
    messageLower.includes("kenaikan paras laut")
  ) {
    severity = "Critical";
  } 
  // Warning severity - Second Category, strong winds
  else if (
    messageLower.includes("second category") ||
    messageLower.includes("kategori kedua") ||
    messageLower.includes("strong wind") ||
    messageLower.includes("angin kencang") ||
    messageLower.includes("rough seas") ||
    messageLower.includes("laut bergelora") ||
    messageLower.includes("continuous rain") ||
    messageLower.includes("hujan berterusan")
  ) {
    severity = "Warning";
  }
  // Info severity - First Category, alerts
  else if (
    messageLower.includes("first category") ||
    messageLower.includes("kategori pertama") ||
    messageLower.includes("alert") ||
    messageLower.includes("waspada") ||
    messageLower.includes("advisory") ||
    messageLower.includes("nasihat")
  ) {
    severity = "Info";
  }

  return {
    region: dto.location,
    severity,
    message: dto.message,
    updatedAt: formatTimeAgo(dto.updatedAt),
  };
}

export function useWeatherAlertsQuery(
  params?: WeatherControllerGetWeatherAlertsParams
) {
  const query = useWeatherControllerGetWeatherAlerts(params);
  const alerts = useMemo(
    () => query.data?.data?.map(transformWeatherAlert) ?? [],
    [query.data?.data]
  );
  const parsedError = query.error ? parseError(query.error) : undefined;
  const total = query.data?.count ?? 0;

  return {
    ...query,
    alerts,
    total,
    error: parsedError,
  };
}

export default function useWeather(
  params?: WeatherControllerGetWeatherAlertsParams
) {
  const alertsQuery = useWeatherAlertsQuery(params);

  return {
    alerts: alertsQuery.alerts,
    total: alertsQuery.total,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
  };
}

