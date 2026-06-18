import { CountryFlag } from '@/components/common/CountryFlag';
import type { PaymentCountry } from '@/api/payment.api';

interface PaymentCountrySelectProps {
  countries: PaymentCountry[];
  value: string;
  onChange: (code: string) => void;
  label: string;
  placeholder?: string;
}

export function PaymentCountrySelect({
  countries,
  value,
  onChange,
  label,
  placeholder,
}: PaymentCountrySelectProps) {
  return (
    <div>
      <label htmlFor="payment-country" className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <div className="relative">
        {value && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <CountryFlag countryCode={value} className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
          </span>
        )}
        <select
          id="payment-country"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-md border border-white/10 bg-background py-2 text-sm text-white ${value ? 'pl-10 pr-3' : 'px-3'}`}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
