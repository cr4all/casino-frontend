import { PHONE_COUNTRIES } from '@/data/phoneCountries';

export function formatCountryLabel(
  countryCode: string | null | undefined,
  countryName?: string | null,
): string {
  if (!countryCode) {
    return '—';
  }

  const name =
    countryName ??
    PHONE_COUNTRIES.find((country) => country.code === countryCode.toUpperCase())?.name;

  if (name) {
    return `${name} (${countryCode.toUpperCase()})`;
  }

  return countryCode.toUpperCase();
}
