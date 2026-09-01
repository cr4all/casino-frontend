import { useEffect } from 'react';
import { initContrastPreference } from '@/stores/contrastStore';

export function useContrastInit() {
  useEffect(() => {
    initContrastPreference();
  }, []);
}
