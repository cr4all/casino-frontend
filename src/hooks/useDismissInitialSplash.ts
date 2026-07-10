import { useEffect } from 'react';

const MIN_SPLASH_MS = 800;
const FADE_OUT_MS = 450;

export function useDismissInitialSplash() {
  useEffect(() => {
    const splash = document.getElementById('site-splash');
    if (!splash) return undefined;

    let cancelled = false;
    let fadeTimer: number | undefined;

    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MIN_SPLASH_MS);
    });
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const windowLoaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener('load', () => resolve(), { once: true });
          });

    void Promise.all([minDelay, fontsReady, windowLoaded]).then(() => {
      if (cancelled) return;
      splash.classList.add('site-splash--hide');
      fadeTimer = window.setTimeout(() => {
        splash.remove();
      }, FADE_OUT_MS);
    });

    return () => {
      cancelled = true;
      if (fadeTimer != null) window.clearTimeout(fadeTimer);
    };
  }, []);
}
