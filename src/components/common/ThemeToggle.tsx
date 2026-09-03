import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isLight}
      aria-label={isLight ? t('common.switchToDarkTheme') : t('common.switchToLightTheme')}
      title={isLight ? t('common.themeDark') : t('common.themeLight')}
      className="theme-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-card text-white transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
    >
      {isLight ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M21 14.3A8.5 8.5 0 1110.2 3 7 7 0 0021 14.3z"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 3v1.5M12 19.5V21M4.5 12H3m18 0h-1.5M6.2 6.2l-1 1m13.6 13.6-1-1M6.2 17.8l-1-1m13.6-13.6-1 1M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
          />
        </svg>
      )}
    </button>
  );
}
