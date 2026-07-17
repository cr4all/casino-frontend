import { bonusApi } from '@/api/bonus.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';

export const BonusService = {
  getAvailable: bonusApi.getAvailable,
  getActive: bonusApi.getActive,

  async claim(policyId: number) {
    const result = await bonusApi.claim(policyId);
    AnalyticsService.track(CasinoAnalyticsEvent.BonusClaimed, {
      policy_id: policyId,
      bonus_id: result.bonus_id,
      amount: result.amount,
      status: result.status,
    });
    return result;
  },
};
