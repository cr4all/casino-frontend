export interface PaymentMarqueeLogo {
  id: string;
  label: string;
  src: string;
  width?: number;
}

export const PAYMENT_MARQUEE_LOGOS: PaymentMarqueeLogo[] = [
  { id: 'paypal', label: 'PayPal', src: '/payment-logos/paypal.svg', width: 72 },
  { id: 'gpay', label: 'Google Pay', src: '/payment-logos/gpay.svg', width: 88 },
  { id: 'upi', label: 'UPI', src: '/payment-logos/upi.svg', width: 48 },
  { id: 'neteller', label: 'Neteller', src: '/payment-logos/neteller-brand.svg', width: 80 },
  { id: 'skrill', label: 'Skrill', src: '/payment-logos/skrill-brand.svg', width: 64 },
  { id: 'bitcoin', label: 'Bitcoin', src: '/payment-logos/bitcoin.svg', width: 88 },
  { id: 'tether', label: 'Tether', src: '/payment-logos/tether-brand.svg', width: 88 },
  { id: 'ethereum', label: 'Ethereum', src: '/payment-logos/ethereum-brand.svg', width: 88 },
  { id: 'tron', label: 'TRON', src: '/payment-logos/tron-brand.svg', width: 80 },
  { id: 'visa', label: 'Visa', src: '/payment-logos/visa.svg', width: 56 },
  { id: 'mastercard', label: 'Mastercard', src: '/payment-logos/mastercard.svg', width: 44 },
  { id: 'discover', label: 'Discover', src: '/payment-logos/discover.svg', width: 72 },
];

export const TRUST_BADGES = [
  { id: 'dmca', label: 'DMCA Protected', src: '/trust-badges/dmca.svg', width: 120 },
  { id: 'gamcare', label: 'GamCare', src: '/trust-badges/gamcare.svg', width: 80 },
  { id: 'age18', label: '18+', src: '/trust-badges/age-18.svg', width: 40 },
] as const;
