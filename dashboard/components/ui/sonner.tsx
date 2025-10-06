"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function Toaster(props: ToasterProps) {
  // Your custom hook detects web & native color scheme safely during hydration
  const colorScheme = useColorScheme(); // returns "light" | "dark"
  const appliedTheme = props.theme ?? colorScheme ?? "light";

  return (
    <Sonner
      theme={appliedTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
