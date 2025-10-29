import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";

export interface ResponsiveLayout {
  width: number;
  height: number;
  isWeb: boolean;
  isDesktop: boolean;
  isMobile: boolean;
}

export function useResponsiveLayout(breakpoint = 1024): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const normalizedWidth = useMemo(() => {
    if (!isWeb) {
      return width;
    }

    return width === 0 ? breakpoint : width;
  }, [breakpoint, isWeb, width]);

  const isDesktop = isWeb && normalizedWidth >= breakpoint;
  const isMobile = !isDesktop;

  return {
    width: normalizedWidth,
    height,
    isWeb,
    isDesktop,
    isMobile,
  };
}

