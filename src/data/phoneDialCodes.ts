import { findPhoneCountry, PHONE_COUNTRIES } from '@/data/phoneCountries';

export interface PhoneCountryRule {
  dial: string;
  minLength: number;
  maxLength: number;
  /** Digit group sizes used for display formatting and placeholder */
  groups: number[];
}

const DEFAULT_RULE: PhoneCountryRule = {
  dial: '+1',
  minLength: 8,
  maxLength: 12,
  groups: [3, 3, 4],
};

/** ISO 3166-1 alpha-2 → national number rules (without country dial code) */
export const PHONE_COUNTRY_RULES: Record<string, PhoneCountryRule> = {
  US: { dial: '+1', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  CA: { dial: '+1', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  GB: { dial: '+44', minLength: 10, maxLength: 10, groups: [4, 3, 3] },
  DE: { dial: '+49', minLength: 10, maxLength: 11, groups: [3, 3, 4] },
  FR: { dial: '+33', minLength: 9, maxLength: 9, groups: [1, 2, 2, 2, 2] },
  ES: { dial: '+34', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  IT: { dial: '+39', minLength: 9, maxLength: 10, groups: [3, 3, 4] },
  PT: { dial: '+351', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  NL: { dial: '+31', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  BE: { dial: '+32', minLength: 9, maxLength: 9, groups: [3, 2, 2, 2] },
  AT: { dial: '+43', minLength: 10, maxLength: 11, groups: [3, 3, 4] },
  CH: { dial: '+41', minLength: 9, maxLength: 9, groups: [2, 3, 2, 2] },
  SE: { dial: '+46', minLength: 9, maxLength: 9, groups: [2, 3, 2, 2] },
  NO: { dial: '+47', minLength: 8, maxLength: 8, groups: [4, 4] },
  DK: { dial: '+45', minLength: 8, maxLength: 8, groups: [4, 4] },
  FI: { dial: '+358', minLength: 9, maxLength: 10, groups: [2, 3, 4] },
  PL: { dial: '+48', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  CZ: { dial: '+420', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  HU: { dial: '+36', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  RO: { dial: '+40', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  BG: { dial: '+359', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  GR: { dial: '+30', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  TR: { dial: '+90', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  RU: { dial: '+7', minLength: 10, maxLength: 10, groups: [3, 3, 2, 2] },
  UA: { dial: '+380', minLength: 9, maxLength: 9, groups: [2, 3, 2, 2] },
  KZ: { dial: '+7', minLength: 10, maxLength: 10, groups: [3, 3, 2, 2] },
  MN: { dial: '+976', minLength: 8, maxLength: 8, groups: [4, 4] },
  CN: { dial: '+86', minLength: 11, maxLength: 11, groups: [3, 4, 4] },
  JP: { dial: '+81', minLength: 10, maxLength: 10, groups: [2, 4, 4] },
  KR: { dial: '+82', minLength: 10, maxLength: 11, groups: [2, 4, 4] },
  IN: { dial: '+91', minLength: 10, maxLength: 10, groups: [5, 5] },
  PK: { dial: '+92', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  BD: { dial: '+880', minLength: 10, maxLength: 10, groups: [4, 3, 3] },
  ID: { dial: '+62', minLength: 10, maxLength: 11, groups: [3, 4, 4] },
  MY: { dial: '+60', minLength: 9, maxLength: 10, groups: [2, 3, 4] },
  SG: { dial: '+65', minLength: 8, maxLength: 8, groups: [4, 4] },
  TH: { dial: '+66', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  VN: { dial: '+84', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  PH: { dial: '+63', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  AU: { dial: '+61', minLength: 9, maxLength: 9, groups: [4, 3, 3] },
  NZ: { dial: '+64', minLength: 9, maxLength: 10, groups: [2, 3, 4] },
  AE: { dial: '+971', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  SA: { dial: '+966', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  IL: { dial: '+972', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  EG: { dial: '+20', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  ZA: { dial: '+27', minLength: 9, maxLength: 9, groups: [2, 3, 4] },
  NG: { dial: '+234', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  KE: { dial: '+254', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  BR: { dial: '+55', minLength: 10, maxLength: 11, groups: [2, 5, 4] },
  MX: { dial: '+52', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  AR: { dial: '+54', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  CL: { dial: '+56', minLength: 9, maxLength: 9, groups: [1, 4, 4] },
  CO: { dial: '+57', minLength: 10, maxLength: 10, groups: [3, 3, 4] },
  PE: { dial: '+51', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  AL: { dial: '+355', minLength: 9, maxLength: 9, groups: [3, 3, 3] },
  MK: { dial: '+389', minLength: 8, maxLength: 8, groups: [4, 4] },
  RS: { dial: '+381', minLength: 8, maxLength: 9, groups: [3, 3, 3] },
  HR: { dial: '+385', minLength: 8, maxLength: 9, groups: [3, 3, 3] },
  SI: { dial: '+386', minLength: 8, maxLength: 8, groups: [4, 4] },
  BA: { dial: '+387', minLength: 8, maxLength: 8, groups: [4, 4] },
  XK: { dial: '+383', minLength: 8, maxLength: 8, groups: [4, 4] },
};

export function getPhoneCountryRule(countryCode: string): PhoneCountryRule {
  const known = PHONE_COUNTRY_RULES[countryCode.toUpperCase()];
  if (known) return known;

  const dial = findPhoneCountry(countryCode)?.dial ?? DEFAULT_RULE.dial;
  return { ...DEFAULT_RULE, dial };
}

export function getDialCode(countryCode: string): string {
  return findPhoneCountry(countryCode)?.dial ?? getPhoneCountryRule(countryCode).dial;
}

export function getPhonePlaceholder(countryCode: string): string {
  const { groups } = getPhoneCountryRule(countryCode);
  return groups.map((size) => 'X'.repeat(size)).join(' ');
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatLocalPhoneNumber(countryCode: string, value: string): string {
  const { maxLength, groups } = getPhoneCountryRule(countryCode);
  const digits = extractDigits(value).slice(0, maxLength);

  const parts: string[] = [];
  let offset = 0;

  for (const size of groups) {
    if (offset >= digits.length) break;
    parts.push(digits.slice(offset, offset + size));
    offset += size;
  }

  if (offset < digits.length) {
    parts.push(digits.slice(offset));
  }

  return parts.join(' ').trim();
}

export function isLocalPhoneValid(countryCode: string, local: string): boolean {
  const { minLength, maxLength } = getPhoneCountryRule(countryCode);
  const length = extractDigits(local).length;
  return length >= minLength && length <= maxLength;
}

export function parsePhoneNumber(
  full: string,
  fallbackCountryCode = 'US',
): { countryCode: string; local: string } {
  const trimmed = full.trim();
  if (!trimmed) {
    return { countryCode: fallbackCountryCode, local: '' };
  }

  const sorted = PHONE_COUNTRIES.map((c) => ({ code: c.code, dial: c.dial }))
    .sort((a, b) => b.dial.length - a.dial.length);

  for (const entry of sorted) {
    if (trimmed.startsWith(entry.dial)) {
      return {
        countryCode: entry.code,
        local: formatLocalPhoneNumber(entry.code, trimmed.slice(entry.dial.length)),
      };
    }
  }

  return {
    countryCode: fallbackCountryCode,
    local: formatLocalPhoneNumber(fallbackCountryCode, trimmed),
  };
}

export function buildFullPhoneNumber(countryCode: string, local: string): string {
  const dial = getDialCode(countryCode);
  const digits = extractDigits(local);
  if (!digits) return '';
  return `${dial}${digits}`;
}
