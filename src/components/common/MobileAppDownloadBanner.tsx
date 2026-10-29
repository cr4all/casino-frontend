import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchMobileAppRelease } from '@/api/mobileApp.api';
import { useTranslation } from '@/hooks/useTranslation';
import { apkDownloadFilename, isHttpUrl } from '@/utils/appVersion';
import { isNativeApp } from '@/utils/capacitor';
import { handleExternalLinkClick } from '@/utils/openExternalUrl';

interface ApkDownload {
  url: string;
  filename: string;
}

async function saveApkAs(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

function useApkDownload(): ApkDownload | null {
  const [download, setDownload] = useState<ApkDownload | null>(null);

  useEffect(() => {
    if (isNativeApp()) return undefined;

    let cancelled = false;
    void fetchMobileAppRelease().then((release) => {
      if (cancelled) return;
      const downloadUrl = release?.download_url;
      if (!isHttpUrl(downloadUrl)) {
        setDownload(null);
        return;
      }

      setDownload({
        url: downloadUrl,
        filename: apkDownloadFilename(release?.version),
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return download;
}

export function MobileAppDownloadBanner() {
  const { t } = useTranslation();
  const apkDownload = useApkDownload();

  if (!apkDownload) return null;

  const label = t('footer.downloadApp');
  const bar = (
    <a
      href={apkDownload.url}
      download={apkDownload.filename}
      className="mobile-app-banner fixed inset-x-0 top-0 z-[35] flex items-center gap-2.5 px-3 lg:hidden"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        handleExternalLinkClick(event);
        if (isNativeApp()) return;

        event.preventDefault();
        void saveApkAs(apkDownload.url, apkDownload.filename);
      }}
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
