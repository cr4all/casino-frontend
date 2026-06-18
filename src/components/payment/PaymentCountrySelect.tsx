import { useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = countries.find((country) => country.code === value) ?? null;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-1 block text-xs text-muted">{label}</span>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selected?.name ?? placeholder ?? label}
        className={`flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm text-white transition-colors ${
          open ? 'border-accent-gold/60' : 'border-white/10 hover:border-white/20'
        }`}
      >
        {selected ? (
          <CountryFlag countryCode={selected.code} className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-full bg-white/10" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1 truncate font-medium">
          {selected?.name ?? placeholder ?? label}
        </span>
        <span className="text-[10px] text-muted" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="scrollbar-dark absolute left-0 right-0 top-full z-50 mt-1 max-h-[22.5rem] overflow-y-auto overscroll-contain rounded-md border border-white/10 bg-card py-1 shadow-card"
        >
          {countries.map((country) => {
            const isSelected = country.code === value;

            return (
              <li key={country.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-accent-gold/10 text-accent-gold'
                      : 'text-white hover:bg-surface'
                  }`}
                >
                  <CountryFlag countryCode={country.code} className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
                  <span className="truncate font-medium">{country.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
