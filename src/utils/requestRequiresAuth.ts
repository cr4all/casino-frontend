/**
 * Player API paths that require a logged-in JWT (JSON Web Token).
 * Guests may still call public catalog/auth endpoints such as /games and /auth/login.
 */
export function requestRequiresAuth(url = '', method = 'get'): boolean {
  const path = normalizeApiPath(url);
  const verb = method.toLowerCase();

  if (!path) {
    return false;
  }

  if (path === 'live-chat/config') {
    return false;
  }

  if (path.startsWith('live-chat/')) {
    return true;
  }

  if (path === 'payment/withdrawal-verification-limits') {
    return false;
  }

  if (path.startsWith('payment/')) {
    return true;
  }

  if (
    path.startsWith('player/') ||
    path.startsWith('wallet/') ||
    path.startsWith('bonus/') ||
    path.startsWith('notifications/') ||
    path.startsWith('support-tickets') ||
    path.startsWith('affiliate/')
  ) {
    return true;
  }

  if (path === 'games/bets' || path === 'games/favorites') {
    return true;
  }

  if (/^games\/\d+\/favorite$/.test(path)) {
    return true;
  }

  if (verb === 'post' && /^games\/\d+\/launch$/.test(path)) {
    return true;
  }

  if (path === 'sports/bets') {
    return true;
  }

  return false;
}

export function normalizeApiPath(url: string): string {
  const withoutQuery = url.split('?')[0] ?? '';

  let pathname = withoutQuery;
  if (withoutQuery.includes('://')) {
    try {
      pathname = new URL(withoutQuery).pathname;
    } catch {
      pathname = withoutQuery;
    }
  }

  return pathname.replace(/^\/api\/v1\/?/i, '').replace(/^\//, '');
}
