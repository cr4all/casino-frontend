const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export function getTurnstileSiteKey(): string | undefined {
  const key = TURNSTILE_SITE_KEY?.trim();
  return key ? key : undefined;
}

export function isTurnstileConfigured(): boolean {
  return getTurnstileSiteKey() !== undefined;
}
