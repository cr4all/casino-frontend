import { useBonusStore } from '@/stores/bonusStore';

export function useBonusProviderSlugs(): readonly string[] {
  return useBonusStore((s) => s.bonusProviderSlugs);
}
