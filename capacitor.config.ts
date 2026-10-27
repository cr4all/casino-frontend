import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for the iBets24 native apps.
 * Production uses bundled web assets from `dist/` — do not set server.url for release builds.
 */
const config: CapacitorConfig = {
  appId: 'com.ibets24.app',
  appName: 'iBets24',
  webDir: 'dist',
  server: {
    // Secure context on Android (required for clipboard, media, etc.).
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    // Sumsub KYC and game iframes may use inline media / camera.
    contentInset: 'automatic',
    allowsLinkPreview: false,
  },
};

export default config;
