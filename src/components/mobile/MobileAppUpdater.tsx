import { useEffect, useState } from 'react';
import { fetchMobileAppRelease } from '@/api/mobileApp.api';
import { useTranslation } from '@/hooks/useTranslation';
import { ApkInstaller } from '@/utils/apkInstaller';
import { getInstalledAppVersion, isHttpsUrl, isNewerVersion } from '@/utils/appVersion';
import { getNativePlatform } from '@/utils/capacitor';

const listeners = new Set<(updating: boolean) => void>();
let updateTask: Promise<void> | null = null;

function notify(updating: boolean): void {
  listeners.forEach((listener) => listener(updating));
}

function startMobileAppUpdate(): Promise<void> {
  if (updateTask) return updateTask;

  updateTask = (async () => {
    const release = await fetchMobileAppRelease();
    const downloadUrl = release?.download_url;
    if (
      !release?.version ||
      !isHttpsUrl(downloadUrl) ||
      !isNewerVersion(release.version, getInstalledAppVersion())
    ) {
      return;
    }

    notify(true);
    try {
      await ApkInstaller.install({ url: downloadUrl });
    } catch {
      // A failed download or a missing install permission leaves the current version running.
    } finally {
      notify(false);
    }
  })();

  return updateTask;
}

export function MobileAppUpdater() {
  const { t } = useTranslation();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (getNativePlatform() !== 'android') return undefined;

    listeners.add(setUpdating);
    void startMobileAppUpdate();

    return () => {
      listeners.delete(setUpdating);
    };
  }, []);

  if (!updating) return null;

  return (
    <div className="mobile-app-update" role="status">
      {t('mobileUpdate.updating')}
    </div>
  );
}
