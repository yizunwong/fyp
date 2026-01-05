import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform, Appearance } from "react-native";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
  try {
    const scheme = Appearance.getColorScheme?.();
    return scheme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getStoredThemeWeb(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    return (localStorage.getItem("theme") as Theme | null) ?? null;
  } catch {
    return null;
  }
}

function setStoredThemeWeb(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

function applyThemeWeb(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo<Theme>(() => {
    if (Platform.OS === "web") {
      return getStoredThemeWeb() ?? getSystemTheme();
    }
    return getSystemTheme();
  }, []);

  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    if (Platform.OS === "web") {
      applyThemeWeb(theme);
      setStoredThemeWeb(theme);
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggle,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

