import { SMILEPAYZ_PAYMENT_METHODS } from '@/data/smilepayzPaymentMethods';

export interface PaymentMarqueeLogo {
  id: string;
  label: string;
  src: string;
}

const PAYMENT_LOGO_BASE = '/payment-logos/marquee';

export const PAYMENT_MARQUEE_LOGOS: PaymentMarqueeLogo[] = SMILEPAYZ_PAYMENT_METHODS.map(
  (method) => ({
    id: method.id,
    label: method.label,
    src: `${PAYMENT_LOGO_BASE}/${method.id}.png`,
  }),
);

export const TRUST_BADGES = [
  { id: 'dmca', label: 'DMCA Protected', src: '/trust-badges/dmca.svg', width: 120 },
  { id: 'gamcare', label: 'GamCare', src: '/trust-badges/gamcare.svg', width: 80 },
  { id: 'age18', label: '18+', src: '/trust-badges/age-18.svg', width: 40 },
] as const;
