import methods from '@/data/smilepayzPaymentMethods.json';

export interface SmilePayzPaymentMethod {
  id: string;
  label: string;
  color: string;
}

export const SMILEPAYZ_PAYMENT_METHODS = methods as SmilePayzPaymentMethod[];

export type SmilePayzPaymentMethodId = (typeof SMILEPAYZ_PAYMENT_METHODS)[number]['id'];
