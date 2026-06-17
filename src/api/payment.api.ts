import api from '@/api/axios';
import type { ApiResponse, PaginationMeta } from '@/types';

export interface PaymentMethod {
  id: number;
  type: string;
  name: string;
  min_amount: string;
  max_amount: string | null;
  payment_currency?: string;
  wallet_currency?: string | null;
}

export interface CryptoCurrency {
  code: string;
  name: string;
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
  currency: string;
  credited_amount: string | null;
  credited_currency: string | null;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  confirmed_at: string | null;
}

export interface WithdrawalItem {
  id: number;
  amount: string;
  currency: string;
  status: string;
  payment_method: string | null;
  created_at: string | null;
  processed_at: string | null;
}

export const paymentApi = {
  getMethods: async () => {
    const { data } = await api.get<ApiResponse<PaymentMethod[]>>('/payment/methods');
    return data.data;
  },

  getDepositQuote: async (paymentMethodId: number, amount: string) => {
    const { data } = await api.get<ApiResponse<DepositQuote>>('/payment/deposits/quote', {
      params: { payment_method_id: paymentMethodId, amount },
    });
    return data.data;
  },

  getCryptoCurrencies: async (paymentMethodId?: number) => {
    const { data } = await api.get<ApiResponse<{ items: CryptoCurrency[] }>>('/payment/crypto/currencies', {
      params: paymentMethodId ? { payment_method_id: paymentMethodId } : undefined,
    });
    return data.data.items;
  },

  createDeposit: async (paymentMethodId: number, amount: string, payCurrency?: string) => {
    const { data } = await api.post<ApiResponse<DepositRequest>>('/payment/deposits', {
      payment_method_id: paymentMethodId,
      amount,
      ...(payCurrency ? { pay_currency: payCurrency } : {}),
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

  createWithdrawal: async (paymentMethodId: number, amount: string, destination: Record<string, string>) => {
    const { data } = await api.post<ApiResponse<{ withdrawal_id: number; status: string; amount: string }>>(
      '/payment/withdrawals',
      { payment_method_id: paymentMethodId, amount, destination },
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
