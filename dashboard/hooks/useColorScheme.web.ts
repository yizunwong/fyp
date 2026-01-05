import { useEffect, useState, useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/contexts/ThemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 * Also respects the theme toggle from ThemeContext
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const themeContext = useContext(ThemeContext);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // If theme context is available (user has toggled theme), use it
  if (themeContext) {
    return themeContext.theme;
  }

  // Otherwise, fall back to system preference
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
