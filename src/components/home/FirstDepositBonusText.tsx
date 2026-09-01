import { useTranslation } from '@/hooks/useTranslation';
import { HeroBannerText } from '@/components/home/HeroBannerText';
import { HERO_FIRST_DEPOSIT_MAX_USD } from '@/constants/heroBannerPromo';

export function FirstDepositBonusText() {
  const { t } = useTranslation();

  return (
    <HeroBannerText
      topLine={t('hero.firstDepositRegister')}
      titleLine={t('hero.firstDepositTitle')}
      heroLine={t('hero.firstDepositBonus')}
      badgeGold={t('hero.firstDepositUpTo', { amount: HERO_FIRST_DEPOSIT_MAX_USD })}
      badgeWhite={t('hero.firstDepositFreeSpins')}
    />
  );
}

export function firstDepositBannerAriaLabel(
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  return [
    t('hero.firstDepositRegister'),
    t('hero.firstDepositTitle'),
    t('hero.firstDepositBonus'),
    t('hero.firstDepositUpTo', { amount: HERO_FIRST_DEPOSIT_MAX_USD }),
    t('hero.firstDepositFreeSpins'),
  ].join(' — ');
}
