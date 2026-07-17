import type { LoginPayload, RegisterPayload } from '@/api/auth.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';
import { useAuthStore } from '@/stores/authStore';
import { isPostRegisterLoginChallengeError } from '@/utils/apiError';

export const AuthService = {
  async login(credentials: LoginPayload): Promise<void> {
    await useAuthStore.getState().login(credentials);
    AnalyticsService.track(CasinoAnalyticsEvent.LoginCompleted, {});
  },

  async register(payload: RegisterPayload): Promise<void> {
    try {
      await useAuthStore.getState().register(payload);
      AnalyticsService.track(CasinoAnalyticsEvent.RegisterCompleted, {});
    } catch (err) {
      if (isPostRegisterLoginChallengeError(err)) {
        AnalyticsService.track(CasinoAnalyticsEvent.RegisterCompleted, {});
      }
      throw err;
    }
  },

  logout(): void {
    AnalyticsService.track(CasinoAnalyticsEvent.Logout, {});
    useAuthStore.getState().logout();
  },
};
