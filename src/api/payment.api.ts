import api from '@/api/axios';
import { buildRiskContext } from '@/lib/deviceContext';
import type { ApiResponse, PaginationMeta } from '@/types';

export interface PaymentCountry {
  code: string;
  name: string;
}

export interface PaymentCountryList {
  countries: PaymentCountry[];
  default_country: string | null;
}

export interface PaymentDestinationField {
  name: string;
  label: string;
  required: boolean;
}

export interface PaymentOption {
  key: string;
  payment_method_id: number;
  kind: 'local' | 'crypto' | 'manual' | 'credit_card';
  provider: string | null;
  label: string;
  description: string | null;
  logo_url: string | null;
  logo_key: string | null;
  payment_currency: string;
  limits_currency?: string | null;
  min_amount: string;
  max_amount: string | null;
  local_country: string | null;
  local_payment_method: string | null;
  pay_currency: string | null;
  destination_fields: PaymentDestinationField[];
}

export interface PaymentOptionList {
  country: PaymentCountry;
  items: PaymentOption[];
}

export interface WithdrawalVerificationLimits {
  email_verified_limit: string;
  phone_verified_limit: string;
}

export interface DepositQuote {
  payment_amount: string;
  payment_currency: string;
  credited_amount: string;
  wallet_currency: string;
  exchange_rate: string;
  exchange_rate_at?: string;
  rate_display?: string;
  is_estimate: boolean;
}

export interface DepositRequest {
  deposit_id: number;
  status: string;
  amount: string;
  currency?: string;
  estimated_credit?: DepositQuote | null;
  payment_info: Record<string, unknown>;
}

export interface DepositItem {
  id: number;
  amount: string;
  received_amount: string | null;
  currency: string;
  credited_amount: string | null;
  credited_currency: string | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  confirmed_at: string | null;
}

export interface WithdrawQuote {
  wallet_amount: string;
  wallet_currency: string;
  payment_amount: string;
  payment_currency: string;
  exchange_rate: string;
  exchange_rate_at?: string;
  rate_display?: string;
  is_estimate: boolean;
}

export interface WithdrawalItem {
  id: number;
  amount: string;
  currency: string;
  payment_amount?: string | null;
  payment_currency?: string | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  processed_at: string | null;
}

export const paymentApi = {
  getCountries: async () => {
    const { data } = await api.get<ApiResponse<PaymentCountryList>>('/payment/countries');
    return data.data;
  },

  getWithdrawalVerificationLimits: async () => {
    const { data } = await api.get<ApiResponse<WithdrawalVerificationLimits>>(
      '/payment/withdrawal-verification-limits',
    );
    return data.data;
  },

  getDepositOptions: async (country: string) => {
    const { data } = await api.get<ApiResponse<PaymentOptionList>>('/payment/deposit-options', {
      params: { country },
    });
    return data.data;
  },

  getWithdrawOptions: async (country: string) => {
    const { data } = await api.get<ApiResponse<PaymentOptionList>>('/payment/withdraw-options', {
      params: { country },
    });
    return data.data;
  },

  getDepositQuote: async (optionKey: string, amount: string, country: string) => {
    const { data } = await api.get<ApiResponse<DepositQuote>>('/payment/deposits/quote', {
      params: { option_key: optionKey, amount, country },
    });
    return data.data;
  },

  getWithdrawQuote: async (optionKey: string, amount: string, country: string) => {
    const { data } = await api.get<ApiResponse<WithdrawQuote>>('/payment/withdrawals/quote', {
      params: { option_key: optionKey, amount, country },
    });
    return data.data;
  },

  createDeposit: async (
    optionKey: string,
    amount: string,
    country: string,
    turnstileToken?: string,
    destination?: Record<string, string>,
  ) => {
    const risk_context = await buildRiskContext(turnstileToken);
    const { data } = await api.post<ApiResponse<DepositRequest>>('/payment/deposits', {
      option_key: optionKey,
      amount,
      country,
      ...(destination && Object.keys(destination).length > 0 ? { destination } : {}),
      risk_context,
    });
    return data.data;
  },

  getDeposits: async (page = 1, perPage = 20, filters?: { status?: string }) => {
    const { data } = await api.get<ApiResponse<{ items: DepositItem[]; pagination: PaginationMeta }>>(
      '/payment/deposits',
      { params: { page, per_page: perPage, ...filters } },
    );
    return data.data;
  },

  createWithdrawal: async (
    optionKey: string,
    amount: string,
    country: string,
    destination: Record<string, string>,
    turnstileToken?: string,
  ) => {
    const risk_context = await buildRiskContext(turnstileToken);
    const { data } = await api.post<ApiResponse<{
      withdrawal_id: number;
      status: string;
      amount: string;
      currency?: string;
      estimated_payout?: WithdrawQuote | null;
    }>>(
      '/payment/withdrawals',
      { option_key: optionKey, amount, country, destination, risk_context },
    );
    return data.data;
  },

  getWithdrawals: async (page = 1, perPage = 20, filters?: { status?: string }) => {
    const { data } = await api.get<ApiResponse<{ items: WithdrawalItem[]; pagination: PaginationMeta }>>(
      '/payment/withdrawals',
      { params: { page, per_page: perPage, ...filters } },
    );
    return data.data;
  },
};
