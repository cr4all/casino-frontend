import { useEffect, useMemo, useRef, useState } from 'react';
import type { CryptoCurrency } from '@/api/payment.api';
import { CryptoIcon } from '@/components/deposit/CryptoIcon';
import { useTranslation } from '@/hooks/useTranslation';

interface CryptoCurrencyPickerProps {
  currencies: CryptoCurrency[];
  value: string;
  onChange: (code: string) => void;
  loading?: boolean;
  loadingLabel: string;
}

function CurrencyOption({
  currency,
  selected,
  onSelect,
}: {
  currency: CryptoCurrency;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
        selected ? 'bg-accent-gold/10' : 'hover:bg-surface'
      }`}
      aria-selected={selected}
    >
      <CryptoIcon code={currency.code} className="h-8 w-8 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{currency.code}</p>
        <p className="text-xs text-muted">{currency.name}</p>
      </div>
    </button>
  );
}

export function CryptoCurrencyPicker({
  currencies,
  value,
  onChange,
  loading,
  loadingLabel,
}: CryptoCurrencyPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = currencies.find((currency) => currency.code === value);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currencies;

    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query),
    );
  }, [currencies, search]);

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

  useEffect(() => {
    if (open) {
      setSearch('');
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  if (loading) {
    return <p className="text-sm text-muted">{loadingLabel}</p>;
  }

  if (currencies.length === 0) {
    return null;
  }

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-background px-3 py-2.5 text-left transition-colors hover:border-accent-gold/40 focus:border-accent-gold/40 focus:outline-none"
      >
        {selected ? (
          <>
            <CryptoIcon code={selected.code} className="h-7 w-7 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{selected.code}</p>
              <p className="text-xs text-muted">{selected.name}</p>
            </div>
          </>
        ) : (
          <span className="flex-1 text-sm text-muted">{t('deposit.currency')}</span>
        )}
        <span className="text-xs text-muted" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/15 bg-card shadow-card"
        >
          <div className="border-b border-white/10 bg-surface/80 p-2">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-background px-3 py-2">
              <svg
                className="h-4 w-4 shrink-0 text-muted"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16 16l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('deposit.searchCurrency')}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <p className="px-3 pb-1 pt-2 text-xs text-muted">{t('deposit.popularCurrencies')}</p>

          <div className="scrollbar-dark max-h-56 overflow-y-auto overscroll-contain pb-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">{t('deposit.noCurrencyFound')}</p>
            ) : (
              filtered.map((currency) => (
                <CurrencyOption
                  key={currency.code}
                  currency={currency}
                  selected={currency.code === value}
                  onSelect={() => handleSelect(currency.code)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
