import { registerPlugin } from '@capacitor/core';

export interface ApkInstallerPlugin {
  install(options: { url: string }): Promise<void>;
}

export const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller');
