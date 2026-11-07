import type { ActiveBonus } from '@/api/bonus.api';

/** Signup promo-code bonuses keep the admin policy name off the player UI. */
export function activeBonusTitle(
  bonus: Pick<ActiveBonus, 'type' | 'policy_name'>,
  promotionLabel: string,
  fallback: string,
): string {
  if (bonus.type === 'promotion') {
    return promotionLabel;
  }

  const name = bonus.policy_name?.trim();
  return name ? name : fallback;
}
