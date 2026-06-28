import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth.api';
import { disconnectEcho } from '@/lib/echo';
import type { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  login: (credentials: {
    email?: string;
    username?: string;
    phone?: string;
    password: string;
    turnstileToken?: string;
  }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    password_confirmation: string;
    nickname: string;
    phone: string;
    country: string;
    currency: string;
    affiliate_code?: string;
    turnstileToken?: string;
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

      login: async (credentials) => {
        const result = await authApi.login(credentials);
        set({
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          user: result.user,
          isAuthenticated: true,
        });
      },

      register: async (payload) => {
        const { turnstileToken, ...registerPayload } = payload;
        await authApi.register({ ...registerPayload, turnstileToken });
        await get().login({
          email: payload.email,
          password: payload.password,
          turnstileToken,
        });
      },

      logout: () => {
        const refreshToken = get().refreshToken;
        if (refreshToken) {
          authApi.logout(refreshToken).catch(() => undefined);
        }
        disconnectEcho();
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
