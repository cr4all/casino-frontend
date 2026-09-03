import { useEffect } from 'react';
import { initThemePreference } from '@/stores/themeStore';

export function useThemeInit() {
  useEffect(() => {
    initThemePreference();
  }, []);
}
