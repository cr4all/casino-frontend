import { describe, expect, it } from 'vitest';
import { normalizeApiPath, requestRequiresAuth } from './requestRequiresAuth';

describe('normalizeApiPath', () => {
  it('strips the /api/v1 prefix, leading slash, and query string', () => {
    expect(normalizeApiPath('/player/me')).toBe('player/me');
    expect(normalizeApiPath('/api/v1/wallet/balance')).toBe('wallet/balance');
    expect(normalizeApiPath('https://api.example.com/api/v1/player/me?x=1')).toBe('player/me');
  });
});

describe('requestRequiresAuth', () => {
  it('requires a login for account, wallet, bonus, and notification APIs', () => {
    expect(requestRequiresAuth('/player/me')).toBe(true);
    expect(requestRequiresAuth('/wallet/balance')).toBe(true);
    expect(requestRequiresAuth('/bonus/available')).toBe(true);
    expect(requestRequiresAuth('/bonus/active')).toBe(true);
    expect(requestRequiresAuth('/notifications/messages')).toBe(true);
    expect(requestRequiresAuth('/notifications/popups')).toBe(true);
    expect(requestRequiresAuth('/support-tickets/unread')).toBe(true);
    expect(requestRequiresAuth('/affiliate/me')).toBe(true);
    expect(requestRequiresAuth('/player/invite')).toBe(true);
  });

  it('requires a login for favorites, game launch, and sports bet history', () => {
    expect(requestRequiresAuth('/games/favorites')).toBe(true);
    expect(requestRequiresAuth('/games/bets')).toBe(true);
    expect(requestRequiresAuth('/games/12/favorite', 'post')).toBe(true);
    expect(requestRequiresAuth('/games/12/favorite', 'delete')).toBe(true);
    expect(requestRequiresAuth('/games/12/launch', 'post')).toBe(true);
    expect(requestRequiresAuth('/sports/bets')).toBe(true);
  });

  it('allows guests to call public catalog and auth endpoints', () => {
    expect(requestRequiresAuth('/games')).toBe(false);
    expect(requestRequiresAuth('/games/12')).toBe(false);
    expect(requestRequiresAuth('/games/vendors')).toBe(false);
    expect(requestRequiresAuth('/games/types')).toBe(false);
    expect(requestRequiresAuth('/auth/session-policy')).toBe(false);
    expect(requestRequiresAuth('/auth/login', 'post')).toBe(false);
    expect(requestRequiresAuth('/auth/register-options')).toBe(false);
    expect(requestRequiresAuth('/live-chat/config')).toBe(false);
    expect(requestRequiresAuth('/player-levels/tiers')).toBe(false);
    expect(requestRequiresAuth('/sports/launch', 'post')).toBe(false);
    expect(requestRequiresAuth('/payment/withdrawal-verification-limits')).toBe(false);
  });

  it('requires a login for live chat conversation APIs but not the public config', () => {
    expect(requestRequiresAuth('/live-chat/config')).toBe(false);
    expect(requestRequiresAuth('/live-chat/unread')).toBe(true);
    expect(requestRequiresAuth('/live-chat/conversation')).toBe(true);
    expect(requestRequiresAuth('/live-chat/messages')).toBe(true);
  });
});
