import { describe, expect, it } from 'vitest';
import type { ActiveBonus } from '@/api/bonus.api';
import {
  activeBonusHasRemainingBenefit,
  collectBonusProviderSlugs,
  gameHasProviderBonus,
} from './bonusAvailability';

function makeActiveBonus(overrides: Partial<ActiveBonus> = {}): ActiveBonus {
  return {
    id: 1,
    policy_name: 'Test Bonus',
    type: 'free_spin',
    amount: '0.0000',
    status: 'active',
    wagering: null,
    provider_slug: 'gameboy',
    spin_count: 10,
    spins_used: 0,
    ...overrides,
  };
}

describe('activeBonusHasRemainingBenefit', () => {
  it('returns true for active first_deposit with provider_slug', () => {
    const bonus = makeActiveBonus({
      type: 'first_deposit',
      amount: '80.0000',
      provider_slug: 'gameboy',
      spin_count: undefined,
      spins_used: undefined,
    });

    expect(activeBonusHasRemainingBenefit(bonus)).toBe(true);
  });

  it('returns true for active free_spin with remaining spins', () => {
    const bonus = makeActiveBonus({
      type: 'free_spin',
      spin_count: 10,
      spins_used: 3,
    });

    expect(activeBonusHasRemainingBenefit(bonus)).toBe(true);
  });

  it('returns false for free_spin with no spins remaining', () => {
    const bonus = makeActiveBonus({
      type: 'free_spin',
      spin_count: 10,
      spins_used: 10,
    });

    expect(activeBonusHasRemainingBenefit(bonus)).toBe(false);
  });

  it('returns false when status is not active', () => {
    const bonus = makeActiveBonus({
      type: 'first_deposit',
      status: 'completed',
    });

    expect(activeBonusHasRemainingBenefit(bonus)).toBe(false);
  });

  it('returns false when provider_slug is missing', () => {
    const bonus = makeActiveBonus({
      type: 'first_deposit',
      provider_slug: null,
    });

    expect(activeBonusHasRemainingBenefit(bonus)).toBe(false);
  });

  it('returns false for unsupported bonus types', () => {
    const bonus = makeActiveBonus({
      type: 'welcome',
      provider_slug: 'gameboy',
    });

    expect(activeBonusHasRemainingBenefit(bonus)).toBe(false);
  });
});

describe('collectBonusProviderSlugs', () => {
  it('collects slug from active first_deposit bonus', () => {
    const active = [
      makeActiveBonus({
        type: 'first_deposit',
        provider_slug: 'gameboy',
        spin_count: undefined,
        spins_used: undefined,
      }),
    ];

    expect(collectBonusProviderSlugs([], active)).toEqual(['gameboy']);
  });

  it('collects slug from active free_spin bonus with remaining spins', () => {
    const active = [
      makeActiveBonus({
        type: 'free_spin',
        provider_slug: 'goldengatex',
        spin_count: 5,
        spins_used: 2,
      }),
    ];

    expect(collectBonusProviderSlugs([], active)).toEqual(['goldengatex']);
  });

  it('deduplicates when both bonus types target the same provider', () => {
    const active = [
      makeActiveBonus({
        id: 1,
        type: 'first_deposit',
        provider_slug: 'gameboy',
        spin_count: undefined,
        spins_used: undefined,
      }),
      makeActiveBonus({
        id: 2,
        type: 'free_spin',
        provider_slug: 'gameboy',
        spin_count: 10,
        spins_used: 0,
      }),
    ];

    expect(collectBonusProviderSlugs([], active)).toEqual(['gameboy']);
  });

  it('returns empty array when no qualifying bonuses exist', () => {
    const active = [
      makeActiveBonus({
        type: 'free_spin',
        spin_count: 10,
        spins_used: 10,
      }),
      makeActiveBonus({
        type: 'welcome',
        provider_slug: 'gameboy',
      }),
    ];

    expect(collectBonusProviderSlugs([], active)).toEqual([]);
  });
});

describe('gameHasProviderBonus', () => {
  it('returns true when provider slug is in the bonus list', () => {
    expect(gameHasProviderBonus('gameboy', ['gameboy', 'goldengatex'])).toBe(true);
  });

  it('returns false when provider slug is not in the bonus list', () => {
    expect(gameHasProviderBonus('other', ['gameboy'])).toBe(false);
  });

  it('returns false when provider slug is missing', () => {
    expect(gameHasProviderBonus(null, ['gameboy'])).toBe(false);
  });
});
