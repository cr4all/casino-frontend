const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

/** True when `remote` is a greater x.y.z version than `current`. */
export function isNewerVersion(remote: string, current: string): boolean {
  const next = parseSemver(remote);
  const installed = parseSemver(current);
  if (!next || !installed) return false;

  for (let index = 0; index < 3; index += 1) {
    const remotePart = next[index] ?? 0;
    const currentPart = installed[index] ?? 0;
    if (remotePart > currentPart) return true;
    if (remotePart < currentPart) return false;
  }

  return false;
}

export function isHttpsUrl(value: string | null | undefined): value is string {
  return urlProtocol(value) === 'https:';
}

/** Absolute http or https URL. The mobile-web banner also accepts LAN http links. */
export function isHttpUrl(value: string | null | undefined): value is string {
  const protocol = urlProtocol(value);
  return protocol === 'http:' || protocol === 'https:';
}

function urlProtocol(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).protocol;
  } catch {
    return null;
  }
}

/** Version baked in from package.json at build time. */
export function getInstalledAppVersion(): string {
  const version = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__.trim() : '';
  return SEMVER.test(version) ? version : '0.0.0';
}

/** Suggested on-disk name for a published Android APK download. */
export function apkDownloadFilename(version: string | null | undefined): string {
  const cleaned = (version ?? '').trim();
  return `ibets24_${SEMVER.test(cleaned) ? cleaned : 'latest'}.apk`;
}

function parseSemver(value: string): [number, number, number] | null {
  const match = SEMVER.exec(value.trim());
  if (!match) return null;

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
