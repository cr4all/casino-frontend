import { useEffect, useState } from 'react';
import { fetchMobileAppRelease } from '@/api/mobileApp.api';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTranslation } from '@/hooks/useTranslation';
import { ApkInstaller } from '@/utils/apkInstaller';
import { getInstalledAppVersion, isHttpsUrl, isNewerVersion } from '@/utils/appVersion';
import { getNativePlatform } from '@/utils/capacitor';

interface AvailableRelease {
  version: string;
  downloadUrl: string;
}

let installTask: Promise<void> | null = null;

function installRelease(url: string): Promise<void> {
  if (installTask) return installTask;

  installTask = ApkInstaller.install({ url }).finally(() => {
    installTask = null;
  });

  return installTask;
}

function errorText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return '';

  const record = error as { message?: unknown; errorMessage?: unknown };
  if (typeof record.message === 'string') return record.message;
  if (typeof record.errorMessage === 'string') return record.errorMessage;
  return '';
}

function isInstallPermissionError(error: unknown): boolean {
  return errorText(error).toLowerCase().includes('unknown sources');
}

export function MobileAppUpdater() {
  const { t } = useTranslation();
  const [release, setRelease] = useState<AvailableRelease | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useBodyScrollLock(release !== null);

  useEffect(() => {
    if (getNativePlatform() !== 'android') return undefined;

    let cancelled = false;

    void fetchMobileAppRelease().then((next) => {
      if (cancelled) return;

      const downloadUrl = next?.download_url;
      if (
        !next?.version ||
        !isHttpsUrl(downloadUrl) ||
        !isNewerVersion(next.version, getInstalledAppVersion())
      ) {
        return;
      }

      setRelease({ version: next.version, downloadUrl });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    if (updating) return;
    setRelease(null);
    setError(null);
  };

  const confirm = () => {
    if (!release || updating) return;

    setUpdating(true);
    setError(null);

    void installRelease(release.downloadUrl)
      .catch((reason: unknown) => {
        setError(t(isInstallPermissionError(reason) ? 'mobileUpdate.permission' : 'mobileUpdate.failed'));
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  if (!release) return null;

  return (
    <div className="mobile-app-update" onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-app-update-title"
        aria-busy={updating}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-6 text-left shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="mobile-app-update-title" className="text-lg font-bold text-foreground">
          {t('mobileUpdate.title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {updating
            ? t('mobileUpdate.updating')
            : t('mobileUpdate.message', { version: release.version })}
        </p>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={confirm}
            disabled={updating}
            className="w-full rounded-lg bg-accent-gold py-2.5 text-sm font-bold text-background transition-colors hover:bg-accent-gold/90 disabled:opacity-50"
          >
            {t('mobileUpdate.update')}
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={updating}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {t('mobileUpdate.later')}
          </button>
        </div>
      </div>
    </div>
  );
}
