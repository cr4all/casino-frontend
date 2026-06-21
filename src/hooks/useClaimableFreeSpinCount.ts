import { useBonusStore } from '@/stores/bonusStore';

export function useClaimableFreeSpinCount(): number {
  return useBonusStore((s) => s.claimableFreeSpinCount);
}
