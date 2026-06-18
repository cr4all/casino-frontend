export type RememberedLoginMethod = 'username' | 'phone' | 'email';

export interface RememberedLogin {
  remember: boolean;
  method: RememberedLoginMethod;
  username?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
}

const STORAGE_KEY = 'casino-login-remember';

export function loadRememberedLogin(): RememberedLogin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RememberedLogin;
    if (!parsed.remember) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveRememberedLogin(data: RememberedLogin): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearRememberedLogin(): void {
  localStorage.removeItem(STORAGE_KEY);
}
