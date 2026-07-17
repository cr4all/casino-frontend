import { playerApi } from '@/api/wallet.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';

export const ProfileService = {
  getMe: playerApi.getMe,

  async updateProfile(payload: { nickname?: string; language?: string }) {
    const result = await playerApi.updateProfile(payload);
    AnalyticsService.track(CasinoAnalyticsEvent.ProfileUpdated, {
      fields: Object.keys(payload).filter((key) => payload[key as keyof typeof payload] != null),
    });
    return result;
  },

  async changePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    const result = await playerApi.changePassword(payload);
    AnalyticsService.track(CasinoAnalyticsEvent.PasswordChanged, {});
    return result;
  },

  async requestEmailVerification() {
    const result = await playerApi.requestEmailVerification();
    AnalyticsService.track(CasinoAnalyticsEvent.EmailVerificationRequested, {
      channel: 'email',
    });
    return result;
  },

  async confirmEmailVerification(code: string) {
    const result = await playerApi.confirmEmailVerification(code);
    AnalyticsService.track(CasinoAnalyticsEvent.EmailVerified, { channel: 'email' });
    return result;
  },

  async requestPhoneVerification() {
    const result = await playerApi.requestPhoneVerification();
    AnalyticsService.track(CasinoAnalyticsEvent.PhoneVerificationRequested, {
      channel: 'phone',
    });
    return result;
  },

  async confirmPhoneVerification(code: string) {
    const result = await playerApi.confirmPhoneVerification(code);
    AnalyticsService.track(CasinoAnalyticsEvent.PhoneVerified, { channel: 'phone' });
    return result;
  },

  async createKycAccessToken(currentKycStatus: string) {
    const result = await playerApi.createKycAccessToken();
    AnalyticsService.track(CasinoAnalyticsEvent.KycStarted, {
      kyc_status: currentKycStatus,
    });
    return result;
  },

  /** Token refresh for SumSub SDK — no analytics (already started). */
  refreshKycAccessToken: playerApi.createKycAccessToken,

  async refreshProfileAfterKyc(previousKycStatus?: string) {
    const updated = await playerApi.getMe();
    AnalyticsService.track(CasinoAnalyticsEvent.KycStatusUpdated, {
      kyc_status: updated.kyc_status,
      previous_kyc_status: previousKycStatus,
    });
    return updated;
  },
};
