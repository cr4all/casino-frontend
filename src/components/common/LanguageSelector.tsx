import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/i18n';
import { FlagIcon } from '@/components/common/FlagIcon';

interface LanguageSelectorProps {
  variant?: 'header' | 'profile';
}

export function LanguageSelector({ variant = 'header' }: LanguageSelectorProps) {
  const { language, languages, changeLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = languages.find((lang) => lang.code === language) ?? languages[0];

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

  const handleSelect = async (code: Language) => {
    await changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={variant === 'profile' ? 'w-full' : 'relative'}>
      {variant === 'profile' && (
        <span className="mb-1 block text-xs text-muted">{t('profile.language')}</span>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`${t('common.language')}: ${current.label}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={
          variant === 'profile'
            ? 'flex w-full items-center gap-2 rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white hover:border-accent/40 focus:border-accent focus:outline-none'
            : 'flex h-9 shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-card px-1.5 text-xs text-white hover:border-accent-gold/40 focus:border-accent-gold/40 focus:outline-none sm:gap-1.5 sm:px-2'
        }
      >
        <FlagIcon language={current.code} />
        <span className="hidden truncate font-medium sm:inline">{current.label}</span>
        <span className="text-[10px] text-muted sm:ml-0.5" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('common.language')}
          className={
            variant === 'profile'
              ? 'scrollbar-dark mt-1 max-h-[22.5rem] overflow-y-auto overscroll-contain rounded-md border border-white/10 bg-card py-1 shadow-card'
              : 'scrollbar-dark absolute right-0 top-full z-50 mt-1 min-w-[11rem] max-h-[22.5rem] overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-card py-1 shadow-card'
          }
        >
          {languages.map((lang) => {
            const selected = lang.code === language;
            return (
              <li key={lang.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  aria-label={lang.label}
                  className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors ${
                    selected
                      ? 'bg-accent-gold/10 text-accent-gold'
                      : 'text-white hover:bg-surface'
                  }`}
                >
                  <FlagIcon language={lang.code} />
                  <span className="font-medium">{lang.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
