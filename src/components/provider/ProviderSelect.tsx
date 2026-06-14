import { useEffect, useRef, useState } from 'react';
import type { GameVendor } from '@/api/game.api';
import { getVendorLogoUrl } from '@/data/providerBanners';
import { useTranslation } from '@/hooks/useTranslation';

interface ProviderSelectProps {
  vendors: GameVendor[];
  selectedVendorId: number | null;
  onChange: (vendorId: number | null) => void;
  loading?: boolean;
}

function ProviderLogo({ vendor, className = '' }: { vendor: GameVendor; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getVendorLogoUrl(vendor);
  const showLogo = logoUrl && !imgError;

  if (!showLogo) return null;

  return (
    <img
      src={logoUrl}
      alt=""
      className={`shrink-0 object-contain ${className}`}
      onError={() => setImgError(true)}
    />
  );
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

export function ProviderSelect({ vendors, selectedVendorId, onChange, loading }: ProviderSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId) ?? null;
  const triggerLabel = selectedVendor?.name ?? t('nav.browseAll');

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

  const handleSelect = (vendorId: number | null) => {
    onChange(vendorId);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-80">
      <button
        type="button"
        onClick={() => !loading && setOpen((prev) => !prev)}
        disabled={loading}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center gap-2 rounded-xl border bg-card py-3 pl-3 pr-4 text-left text-sm text-white transition-colors disabled:opacity-50 ${
          open ? 'border-accent-gold' : 'border-white/10 hover:border-accent-gold/40'
        }`}
      >
        <FilterIcon />
        <span className="min-w-0 flex-1 truncate font-medium">{triggerLabel}</span>
        {selectedVendor && (
          <ProviderLogo vendor={selectedVendor} className="h-[22px] w-[72px]" />
        )}
        <span className="text-[10px] text-muted" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="scrollbar-dark absolute right-0 top-full z-50 mt-1 max-h-80 w-full overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-card py-1 shadow-card"
        >
          <li role="option" aria-selected={selectedVendorId === null}>
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                selectedVendorId === null
                  ? 'bg-accent-gold/10 text-accent-gold'
                  : 'text-white hover:bg-surface'
              }`}
            >
              <span className="font-bold">{t('nav.browseAll')}</span>
            </button>
          </li>
          {vendors.map((vendor) => {
            const isSelected = vendor.id === selectedVendorId;
            return (
              <li key={vendor.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(vendor.id)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-accent-gold/10 text-accent-gold' : 'text-white hover:bg-surface'
                  }`}
                >
                  <span className="min-w-0 truncate font-bold">{vendor.name}</span>
                  <ProviderLogo vendor={vendor} className="h-[28px] w-[90px]" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
