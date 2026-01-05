import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/contexts/ThemeContext';

/**
 * useColorScheme hook that respects theme toggle from ThemeContext
 * Falls back to system preference if no theme context is available
 */
export function useColorScheme() {
  const themeContext = useContext(ThemeContext);

  // If theme context is available (user has toggled theme), use it
  if (themeContext) {
    return themeContext.theme;
  }

  // Otherwise, fall back to system preference
  return useRNColorScheme() ?? 'light';
}
