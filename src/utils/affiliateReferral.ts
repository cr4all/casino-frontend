const STORAGE_KEY = 'affiliate_code';

export function captureAffiliateReferralFromUrl(searchParams: URLSearchParams): void {
  const code = searchParams.get('ref') ?? searchParams.get('affiliate');

  if (code && code.trim() !== '') {
    sessionStorage.setItem(STORAGE_KEY, code.trim());
  }
}

export function getStoredAffiliateCode(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearStoredAffiliateCode(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
