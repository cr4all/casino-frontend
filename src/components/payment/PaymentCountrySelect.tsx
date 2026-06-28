import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CountryFlag } from '@/components/common/CountryFlag';
import type { PaymentCountry } from '@/api/payment.api';
import { useTranslation } from '@/hooks/useTranslation';
import { formatLocalizedCountryName } from '@/utils/formatLocalizedCountryName';

interface PaymentCountrySelectProps {
  countries: PaymentCountry[];
  value: string;
  onChange: (code: string) => void;
  label: string;
  placeholder?: string;
}

const MENU_GAP_PX = 4;
const VIEWPORT_PADDING_PX = 12;
const PREFERRED_MAX_HEIGHT_PX = 360;
const MIN_MENU_HEIGHT_PX = 120;

function computeMenuStyle(trigger: HTMLElement): React.CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX - VIEWPORT_PADDING_PX;
  const spaceAbove = rect.top - MENU_GAP_PX - VIEWPORT_PADDING_PX;
  const openUpward = spaceBelow < MIN_MENU_HEIGHT_PX && spaceAbove > spaceBelow;
  const available = openUpward ? spaceAbove : spaceBelow;
  const maxHeight = Math.min(
    PREFERRED_MAX_HEIGHT_PX,
    Math.max(MIN_MENU_HEIGHT_PX, available),
  );

  return {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    maxHeight,
    zIndex: 50,
    ...(openUpward
      ? { bottom: window.innerHeight - rect.top + MENU_GAP_PX }
      : { top: rect.bottom + MENU_GAP_PX }),
  };
}

export function PaymentCountrySelect({
  countries,
  value,
  onChange,
  label,
  placeholder,
}: PaymentCountrySelectProps) {
  const { language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const selected = countries.find((country) => country.code === value) ?? null;
  const selectedLabel = selected
    ? formatLocalizedCountryName(selected.code, language, selected.name)
    : null;

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updateMenu = () => {
      if (!triggerRef.current) {
        return;
      }

      setMenuStyle(computeMenuStyle(triggerRef.current));
    };

    updateMenu();
    window.addEventListener('resize', updateMenu);
    window.addEventListener('scroll', updateMenu, true);

    return () => {
      window.removeEventListener('resize', updateMenu);
      window.removeEventListener('scroll', updateMenu, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target)
        && !menuRef.current?.contains(target)
      ) {
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

  const menu = open ? (
    <ul
      ref={menuRef}
      role="listbox"
      aria-label={label}
      style={menuStyle}
      className="scrollbar-dark overflow-y-auto overscroll-contain rounded-md border border-white/10 bg-card py-1 shadow-card"
    >
      {countries.map((country) => {
        const countryLabel = formatLocalizedCountryName(country.code, language, country.name);
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
              <span className="truncate font-medium">{countryLabel}</span>
            </button>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-1 block text-xs text-muted">{label}</span>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selectedLabel ?? placeholder ?? label}
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
          {selectedLabel ?? placeholder ?? label}
        </span>
        <span className="text-[10px] text-muted" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  );
}
