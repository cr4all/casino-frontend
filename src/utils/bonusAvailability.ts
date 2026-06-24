import type { ActiveBonus, BonusPolicy } from '@/api/bonus.api';

export function resolveSpinsRemaining(bonus: ActiveBonus): number | null {
  if (bonus.spins_remaining != null) {
    return Math.max(0, bonus.spins_remaining);
  }

  if (bonus.spin_count != null) {
    return Math.max(0, bonus.spin_count - (bonus.spins_used ?? 0));
  }

  return null;
}

/** True when an active free spin bonus still has spins left on its provider. */
export function activeBonusHasRemainingBenefit(bonus: ActiveBonus): boolean {
  if (bonus.status !== 'active' || bonus.type !== 'free_spin' || !bonus.provider_slug) {
    return false;
  }

  const spinsRemaining = resolveSpinsRemaining(bonus);
  return spinsRemaining !== null && spinsRemaining > 0;
}

export function countClaimableFreeSpinBonuses(policies: BonusPolicy[]): number {
  return policies.filter((policy) => policy.type === 'free_spin' && policy.claimable).length;
}

export function collectBonusProviderSlugs(
  _available: BonusPolicy[],
  active: ActiveBonus[],
): string[] {
  const slugs = new Set<string>();

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
