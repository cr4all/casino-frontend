import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchMobileAppRelease } from '@/api/mobileApp.api';
import { useTranslation } from '@/hooks/useTranslation';
import { isHttpsUrl } from '@/utils/appVersion';
import { isNativeApp } from '@/utils/capacitor';
import { handleExternalLinkClick } from '@/utils/openExternalUrl';

function useApkDownloadUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isNativeApp()) return undefined;

    let cancelled = false;
    void fetchMobileAppRelease().then((release) => {
      if (cancelled) return;
      const downloadUrl = release?.download_url;
      setUrl(isHttpsUrl(downloadUrl) ? downloadUrl : null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return url;
}

export function MobileAppDownloadBanner() {
  const { t } = useTranslation();
  const apkDownloadUrl = useApkDownloadUrl();

  if (!apkDownloadUrl) return null;

  const label = t('footer.downloadApp');
  const bar = (
    <a
      href={apkDownloadUrl}
      className="mobile-app-banner fixed inset-x-0 top-0 z-[35] flex items-center gap-2.5 px-3 lg:hidden"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleExternalLinkClick}
      aria-label={label}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-gold text-background">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <rect x="7" y="2.5" width="10" height="19" rx="2" strokeWidth="1.75" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M12 7.5v5.5m0 0-2.2-2.2M12 13l2.2-2.2"
          />
          <path strokeLinecap="round" strokeWidth="1.75" d="M10.25 18.25h3.5" />
        </svg>
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{label}</span>
      <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-accent-gold px-3 text-xs font-bold text-background">
        {t('footer.download')}
      </span>
    </a>
  );

  return (
    <>
      <div className="mobile-app-banner-spacer lg:hidden" aria-hidden />
      {createPortal(bar, document.body)}
    </>
  );
}
