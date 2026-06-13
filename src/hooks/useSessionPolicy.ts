import { create } from 'zustand';
import { authApi } from '@/api/auth.api';

export const DEFAULT_IDLE_TIMEOUT_MINUTES = 15;

interface SessionPolicyState {
  idleTimeoutMinutes: number;
  isLoaded: boolean;
  loadSessionPolicy: () => Promise<void>;
}

export const useSessionPolicyStore = create<SessionPolicyState>((set) => ({
  idleTimeoutMinutes: DEFAULT_IDLE_TIMEOUT_MINUTES,
  isLoaded: false,

  loadSessionPolicy: async () => {
    try {
      const policy = await authApi.getSessionPolicy();
      set({
        idleTimeoutMinutes: policy.idle_timeout_minutes,
        isLoaded: true,
      });
    } catch {
      set({
        idleTimeoutMinutes: DEFAULT_IDLE_TIMEOUT_MINUTES,
        isLoaded: true,
      });
    }
  },
}));

export function useSessionPolicy() {
  const idleTimeoutMinutes = useSessionPolicyStore((s) => s.idleTimeoutMinutes);
  const isLoaded = useSessionPolicyStore((s) => s.isLoaded);
  const loadSessionPolicy = useSessionPolicyStore((s) => s.loadSessionPolicy);

  return { idleTimeoutMinutes, isLoaded, loadSessionPolicy };
}
