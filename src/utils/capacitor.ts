import { Capacitor } from '@capacitor/core';

/** True when running inside a Capacitor Android or iOS WebView. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function getNativePlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
