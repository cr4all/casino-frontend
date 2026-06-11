import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth.api';
import type { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    password_confirmation: string;
    nickname: string;
    country: string;
    currency: string;
    affiliate_code?: string;
  }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const result = await authApi.login({ email, password });
        set({
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          user: result.user,
          isAuthenticated: true,
        });
      },

      register: async (payload) => {
        await authApi.register(payload);
        await get().login(payload.email, payload.password);
      },

      logout: () => {
        const refreshToken = get().refreshToken;
        if (refreshToken) {
          authApi.logout(refreshToken).catch(() => undefined);
        }
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'casino-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
