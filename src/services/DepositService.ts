import { paymentApi } from '@/api/payment.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';

export const DepositService = {
  getCountries: paymentApi.getCountries,
  getDepositOptions: paymentApi.getDepositOptions,
  getDepositQuote: paymentApi.getDepositQuote,
  getDeposits: paymentApi.getDeposits,

  async create(
    optionKey: string,
    amount: string,
    country: string,
    turnstileToken?: string,
    destination?: Record<string, string>,
  ) {
    const result = await paymentApi.createDeposit(optionKey, amount, country, turnstileToken, destination);
    AnalyticsService.track(CasinoAnalyticsEvent.DepositSubmitted, {
      deposit_id: result.deposit_id,
      amount: result.amount,
      currency: result.currency,
      option_key: optionKey,
      country,
      status: result.status,
    });
    return result;
  },
};
