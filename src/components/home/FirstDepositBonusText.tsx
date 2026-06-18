import { useTranslation } from '@/hooks/useTranslation';
import { HeroBannerText } from '@/components/home/HeroBannerText';

export function FirstDepositBonusText() {
  const { t } = useTranslation();

  return (
    <HeroBannerText
      topLine={t('hero.firstDepositRegister')}
      titleLine={t('hero.firstDepositTitle')}
      heroLine={t('hero.firstDepositBonus')}
      badgeGold={t('hero.firstDepositUpTo')}
      badgeWhite={t('hero.firstDepositFreeSpins')}
    />
  );
}

export function firstDepositBannerAriaLabel(t: (key: string) => string): string {
  return [
    t('hero.firstDepositRegister'),
    t('hero.firstDepositTitle'),
    t('hero.firstDepositBonus'),
    t('hero.firstDepositUpTo'),
    t('hero.firstDepositFreeSpins'),
  ].join(' — ');
}
