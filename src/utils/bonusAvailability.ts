import type { ActiveBonus, BonusPolicy } from '@/api/bonus.api';

function parseDecimal(value: string | number | null | undefined): number {
  if (value == null || value === '') {
    return 0;
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(num) ? num : 0;
}

export function resolveSpinsRemaining(bonus: ActiveBonus): number | null {
  if (bonus.spins_remaining != null) {
    return Math.max(0, bonus.spins_remaining);
  }

  if (bonus.spin_count != null) {
    return Math.max(0, bonus.spin_count - (bonus.spins_used ?? 0));
  }

  return null;
}

export function hasRemainingWagering(bonus: ActiveBonus): boolean {
  if (!bonus.wagering) {
    return false;
  }

  const required = parseDecimal(bonus.wagering.required);
  if (required <= 0) {
    return false;
  }

  return parseDecimal(bonus.wagering.wagered) < required;
}

/** True when an active bonus still has usable free spins or bonus balance/wagering left. */
export function activeBonusHasRemainingBenefit(bonus: ActiveBonus): boolean {
  if (bonus.status !== 'active' || !bonus.provider_slug) {
    return false;
  }

  if (bonus.type === 'free_spin') {
    const spinsRemaining = resolveSpinsRemaining(bonus);
    return spinsRemaining !== null && spinsRemaining > 0;
  }

  const amount = parseDecimal(bonus.amount);
  if (amount > 0) {
    return true;
  }

  return hasRemainingWagering(bonus);
}

export function availablePolicyShowsBonusBadge(policy: BonusPolicy): boolean {
  if (!policy.provider_slug || !policy.claimable) {
    return false;
  }

  if (policy.type === 'free_spin') {
    return policy.claim_blocked_reason !== 'already_claimed';
  }

  return false;
}

export function countClaimableFreeSpinBonuses(policies: BonusPolicy[]): number {
  return policies.filter((policy) => policy.type === 'free_spin' && policy.claimable).length;
}

export function collectBonusProviderSlugs(
  available: BonusPolicy[],
  active: ActiveBonus[],
): string[] {
  const slugs = new Set<string>();

  for (const policy of available) {
    if (availablePolicyShowsBonusBadge(policy)) {
      slugs.add(policy.provider_slug!);
    }
  }

  for (const bonus of active) {
    if (activeBonusHasRemainingBenefit(bonus)) {
      slugs.add(bonus.provider_slug!);
    }
  }

  return [...slugs];
}

export function gameHasProviderBonus(
  providerSlug: string | undefined | null,
  bonusProviderSlugs: readonly string[],
): boolean {
  if (!providerSlug) {
    return false;
  }

  return bonusProviderSlugs.includes(providerSlug);
}
