const STORAGE_KEY = 'invite_code';

export function captureInviteReferralFromUrl(searchParams: URLSearchParams): void {
  const code = searchParams.get('invite');

  if (code && code.trim() !== '') {
    sessionStorage.setItem(STORAGE_KEY, code.trim());
  }
}

export function getStoredInviteCode(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearStoredInviteCode(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
