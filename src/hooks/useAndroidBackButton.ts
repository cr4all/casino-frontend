import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { getNativePlatform, isNativeApp } from '@/utils/capacitor';

/**
 * Maps the Android hardware/gesture back button to WebView / SPA history.
 * Exits the app only when there is no history left.
 */
export function useAndroidBackButton() {
  useEffect(() => {
    if (!isNativeApp() || getNativePlatform() !== 'android') {
      return;
    }

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
        return;
      }
      void App.exitApp();
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, []);
}
