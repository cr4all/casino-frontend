import type { PlatformSection } from '@/stores/platformSectionStore';
import { useTranslation } from '@/hooks/useTranslation';

interface PlatformSectionToggleProps {
  section: PlatformSection;
  onChange: (section: PlatformSection) => void;
}

function CasinoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SportsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.5 2.8 4 6.2 4 9s-1.5 6.2-4 9" />
      <path d="M12 3c-2.5 2.8-4 6.2-4 9s1.5 6.2 4 9" />
      <path d="M3.5 9.5h17" />
      <path d="M3.5 14.5h17" />
    </svg>
  );
}

export function PlatformSectionToggle({ section, onChange }: PlatformSectionToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="sidebar-section-toggle" role="tablist" aria-label={t('nav.platformSection')}>
      <div className="sidebar-section-toggle__indicator" data-active={section} aria-hidden />
      <button
        type="button"
        role="tab"
        id="sidebar-tab-casino"
        aria-selected={section === 'casino'}
        aria-controls="sidebar-panel-casino"
        className="sidebar-section-toggle__tab"
        onClick={() => onChange('casino')}
      >
        <CasinoIcon className="sidebar-section-toggle__icon" />
        <span>{t('nav.casino')}</span>
      </button>
      <button
        type="button"
        role="tab"
        id="sidebar-tab-sports"
        aria-selected={section === 'sports'}
        aria-controls="sidebar-panel-sports"
        className="sidebar-section-toggle__tab"
        onClick={() => onChange('sports')}
      >
        <SportsIcon className="sidebar-section-toggle__icon" />
        <span>{t('nav.sports')}</span>
      </button>
    </div>
  );
}
