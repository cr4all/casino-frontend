import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CountryFlag } from '@/components/common/CountryFlag';
import {
  buildFullPhoneNumber,
  formatLocalPhoneNumber,
  getDialCode,
  getPhoneCountryRule,
  getPhonePlaceholder,
  isLocalPhoneValid,
  parsePhoneNumber,
} from '@/data/phoneDialCodes';
import { FieldError, fieldControlClassName } from '@/components/common/FieldError';
import { filterPhoneCountries, findPhoneCountry } from '@/data/phoneCountries';

interface PhoneNumberInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  error?: string;
}

const fieldClassName =
  'rounded-md border border-white/10 bg-card text-sm text-white focus:border-accent focus:outline-none';

export function PhoneNumberInput({
  id = 'phone-number',
  label,
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  disabled = false,
  hideLabel = false,
  error,
}: PhoneNumberInputProps) {
  const { t } = useTranslation();
  const listId = useId();
  const searchId = `${id}-search`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localNumber, setLocalNumber] = useState('');

  const rule = getPhoneCountryRule(countryCode);
  const placeholder = getPhonePlaceholder(countryCode);
  const digitCount = localNumber.replace(/\D/g, '').length;
  const isValid = isLocalPhoneValid(countryCode, localNumber);

  const filteredCountries = useMemo(() => filterPhoneCountries(search), [search]);

  const selected = findPhoneCountry(countryCode);
  const dialCode = selected ? getDialCode(selected.code) : '+1';

  useEffect(() => {
    const parsed = parsePhoneNumber(value, countryCode);
    setLocalNumber(formatLocalPhoneNumber(parsed.countryCode, parsed.local));
  }, [value, countryCode]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }

    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const applyLocalNumber = (code: string, raw: string) => {
    const formatted = formatLocalPhoneNumber(code, raw);
    setLocalNumber(formatted);
    onChange(buildFullPhoneNumber(code, formatted));
  };

  const handleLocalChange = (raw: string) => {
    applyLocalNumber(countryCode, raw);
  };

  const handleCountrySelect = (code: string) => {
    const reformatted = formatLocalPhoneNumber(code, localNumber);
    onCountryCodeChange(code);
    setLocalNumber(reformatted);
    onChange(buildFullPhoneNumber(code, reformatted));
    setOpen(false);
  };

  const lengthHint =
    rule.minLength === rule.maxLength
      ? t('auth.phoneDigitsExact', { count: rule.maxLength })
      : t('auth.phoneDigitsRange', { min: rule.minLength, max: rule.maxLength });
  const errorId = error ? `${id}-error` : undefined;
  const showInvalid = Boolean(error) || (digitCount > 0 && !isValid);

  return (
    <div>
      <label
        htmlFor={id}
        className={hideLabel ? 'sr-only' : 'mb-1 block text-xs text-muted'}
      >
        {label}
      </label>
      <div className="flex gap-2">
        <div ref={containerRef} className="relative shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`flex h-[38px] min-w-[7.5rem] items-center gap-2 border-white/10 px-2.5 ${fieldClassName} disabled:opacity-50`}
          >
            {selected ? (
              <CountryFlag countryCode={selected.code} />
            ) : (
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] text-muted"
                aria-hidden="true"
              >
                ?
              </span>
            )}
            <span className="font-semibold text-white">{dialCode}</span>
            <span className="ml-auto text-xs text-muted" aria-hidden="true">
              {open ? '▴' : '▾'}
            </span>
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-white/10 bg-card shadow-card">
              <div className="border-b border-white/10 p-2">
                <label htmlFor={searchId} className="mb-1 block text-[11px] text-muted">
                  {t('auth.phoneCodeSearch')}
                </label>
                <input
                  ref={searchRef}
                  id={searchId}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('auth.phoneCodeSearchPlaceholder')}
                  className={`w-full px-2.5 py-2 ${fieldClassName}`}
                />
              </div>
              <ul
                id={listId}
                role="listbox"
                className="max-h-52 overflow-y-auto py-1"
              >
                {filteredCountries.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-muted">{t('auth.phoneCodeNoResults')}</li>
                ) : (
                  filteredCountries.map((country) => (
                    <li key={country.code} role="option" aria-selected={country.code === countryCode}>
                      <button
                        type="button"
                        onClick={() => handleCountrySelect(country.code)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${
                          country.code === countryCode ? 'text-accent-gold' : 'text-white'
                        }`}
                      >
                        <CountryFlag countryCode={country.code} />
                        <span className="min-w-0 flex-1 truncate">{country.name}</span>
                        <span className="shrink-0 text-xs text-muted">{country.dial}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          value={localNumber}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={placeholder}
          minLength={rule.minLength}
          maxLength={rule.maxLength + rule.groups.length - 1}
          aria-invalid={showInvalid ? true : undefined}
          aria-describedby={errorId}
          className={`min-w-0 flex-1 px-3 py-2 ${fieldControlClassName(showInvalid, 'rounded-md')} disabled:opacity-50`}
        />
      </div>
      {error ? (
        <FieldError id={errorId} message={error} />
      ) : (
        <p className="mt-1 text-[11px] text-muted">{lengthHint}</p>
      )}
    </div>
  );
}
