import { paymentApi } from '@/api/payment.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';

export const WithdrawService = {
  getWithdrawOptions: paymentApi.getWithdrawOptions,
  getWithdrawals: paymentApi.getWithdrawals,

  async create(
    optionKey: string,
    amount: string,
    country: string,
    destination: Record<string, string>,
    turnstileToken?: string,
  ) {
    const result = await paymentApi.createWithdrawal(
      optionKey,
      amount,
      country,
      destination,
      turnstileToken,
    );
    AnalyticsService.track(CasinoAnalyticsEvent.WithdrawSubmitted, {
      withdrawal_id: result.withdrawal_id,
      amount: result.amount,
      option_key: optionKey,
      country,
      status: result.status,
    });
    return result;
  },
};
