import { useAuthStore } from '@/stores/authStore';

/**
 * True only after auth persist has loaded and the player has an access token.
 * App-wide account sync hooks must use this so guests never hit login-required APIs.
 */
export function usePlayerSession(): { hasHydrated: boolean; enabled: boolean } {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);

  return {
    hasHydrated,
    enabled: hasHydrated && isAuthenticated && Boolean(accessToken) && role !== 'affiliate',
  };
}
