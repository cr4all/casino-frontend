import { type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useTranslation } from '@/hooks/useTranslation';
import { isRtlLanguage } from '@/stores/languageStore';
import { useAuthStore } from '@/stores/authStore';
import { typePath } from '@/stores/gameStore';
import { usePlatformSectionStore } from '@/stores/platformSectionStore';
import { useUiStore } from '@/stores/uiStore';
import { Button } from '@/components/common/Button';
import { FirstDepositBonusText, firstDepositBannerAriaLabel } from '@/components/home/FirstDepositBonusText';
import { HeroBannerText } from '@/components/home/HeroBannerText';
import {
  HERO_LIVE_CASINO_CASHBACK_PERCENT,
  HERO_PRAGMATIC_CASHBACK_PERCENT,
} from '@/constants/heroBannerPromo';

function HeroSportsCtaButton() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const setSection = usePlatformSectionStore((s) => s.setSection);

  if (!isAuthenticated) {
    return (
      <Button
        variant="gold"
        className="hero-banner-text__cta-link hero-banner-text__cta"
        onClick={() => openModal('register')}
      >
        {t('hero.registerPromo')}
      </Button>
    );
  }

  return (
    <Link
      to="/sports/prematch"
      className="hero-banner-text__cta-link"
      onClick={() => setSection('sports')}
    >
      <Button variant="gold" className="hero-banner-text__cta">
        {t('hero.betNow')}
      </Button>
    </Link>
  );
}

function HeroCtaButton({ playTo }: { playTo: string }) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);

  if (!isAuthenticated) {
    return (
      <Button
        variant="gold"
        className="hero-banner-text__cta-link hero-banner-text__cta"
        onClick={() => openModal('register')}
      >
        {t('hero.registerPromo')}
      </Button>
    );
  }

  return (
    <Link to={playTo} className="hero-banner-text__cta-link">
      <Button variant="gold" className="hero-banner-text__cta">
        {t('hero.playNow')}
      </Button>
    </Link>
  );
}

function HeroSlideDecorations({ showOnMobile = false }: { showOnMobile?: boolean }) {
  const visibility = showOnMobile ? '' : 'max-md:hidden';

  return (
    <>
      <div className={`hero-banner__gold-overlay ${visibility}`} aria-hidden="true" />

      <div className={`hero-banner__text-panel ${visibility}`} aria-hidden="true">
        <div className="hero-banner__text-panel-sparks">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="hero-banner__dark-spark" style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      </div>

      <div className={`hero-banner__sparks ${visibility}`} aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className="hero-banner__spark" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
    </>
  );
}

interface HeroSlideContentProps {
  children: ReactNode;
}

function HeroSlideContent({ children }: HeroSlideContentProps) {
  return (
    <div className="hero-banner__content-wrap relative z-10 flex items-center">
      <div className="hero-banner__content px-6 py-6 md:px-10 md:py-8">{children}</div>
    </div>
  );
}

function WelcomeHeroSlide() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="hero-banner hero-banner--welcome relative overflow-hidden">
      <img
        src="/hero-banner-bg.png"
        alt=""
        className="hero-banner__bg"
        width={1920}
        height={500}
        loading="eager"
      />

      <HeroSlideDecorations showOnMobile />

      <HeroSlideContent>
        <HeroBannerText
          topLine={isAuthenticated ? t('hero.playNow') : t('hero.registerPromo')}
          heroLine="IBETS24"
          subtitleLine={t('hero.welcomeTagline')}
        />
        <HeroCtaButton playTo="/category/all" />
      </HeroSlideContent>
    </div>
  );
}

interface PromoHeroSlideProps {
  imageSrc: string;
  line1: string;
  line1Accent: string;
  line2?: string;
  to: string;
  cta?: 'default' | 'sports';
  accentAsHero?: boolean;
  layout?: 'promo' | 'welcome';
  heroNowrap?: boolean;
  heroCase?: 'uppercase' | 'title';
  subtitleSize?: 'default' | 'large';
}

function PromoHeroSlide({
  imageSrc,
  line1,
  line1Accent,
  line2,
  to,
  cta = 'default',
  accentAsHero = false,
  layout = 'promo',
  heroNowrap = false,
  heroCase = 'uppercase',
  subtitleSize = 'default',
}: PromoHeroSlideProps) {
  return (
    <div className={`hero-banner hero-banner--promo relative overflow-hidden${layout === 'welcome' ? ' hero-banner--welcome' : ''}`}>
      <img src={imageSrc} alt="" className="hero-banner__scene" loading="lazy" />

      <HeroSlideDecorations showOnMobile />

      <HeroSlideContent>
        {layout === 'welcome' ? (
          <HeroBannerText
            topLine={line1}
            heroLine={line1Accent}
            subtitleLine={line2}
            heroNowrap={heroNowrap}
            heroCase={heroCase}
            subtitleSize={subtitleSize}
          />
        ) : (
          <HeroBannerText
            topLine={line1}
            titleLine={accentAsHero ? undefined : line1Accent}
            heroLine={accentAsHero ? line1Accent : line2}
          />
        )}
        {cta === 'sports' ? <HeroSportsCtaButton /> : <HeroCtaButton playTo={to} />}
      </HeroSlideContent>
    </div>
  );
}

function FirstDepositHeroSlide({ backgroundSrc }: { backgroundSrc: string }) {
  const { t } = useTranslation();

  return (
    <div className="hero-banner hero-banner--image-only relative overflow-hidden">
      <img
        src={backgroundSrc}
        alt=""
        className="hero-banner__scene hero-banner__scene--full"
        loading="lazy"
      />
      <div className="hero-banner__text-overlay">
        <FirstDepositBonusText />
      </div>
      <Link
        to="/deposit"
        className="absolute inset-0 z-20 cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-gold"
        aria-label={firstDepositBannerAriaLabel(t)}
      />
    </div>
  );
}

export function HeroBanner() {
  const { t, language } = useTranslation();
  const isRtl = isRtlLanguage(language);

  return (
    <section className="hero-slider" aria-label="Promotions">
      <Swiper
        key={language}
        dir={isRtl ? 'rtl' : 'ltr'}
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        autoHeight={false}
        className="hero-slider__swiper overflow-hidden rounded-xl border border-white/[0.08]"
      >
        <SwiperSlide>
          <WelcomeHeroSlide />
        </SwiperSlide>
        <SwiperSlide>
          <FirstDepositHeroSlide backgroundSrc="/hero-slides/first-deposit-bonus-bg.jpg" />
        </SwiperSlide>
        <SwiperSlide>
          <PromoHeroSlide
            imageSrc="/hero-slides/pragmatic-slots.jpg"
            line1={t('hero.pragmaticLine1')}
            line1Accent={t('hero.pragmaticAccent')}
            line2={t('hero.pragmaticLine2', { percent: HERO_PRAGMATIC_CASHBACK_PERCENT })}
            to={typePath('slot')}
            layout="welcome"
            heroNowrap
            heroCase="title"
            subtitleSize="large"
          />
        </SwiperSlide>
        <SwiperSlide>
          <PromoHeroSlide
            imageSrc="/hero-slides/sportsbook.jpg"
            line1={t('hero.sportsbookLine1')}
            line1Accent={t('hero.sportsbookAccent')}
            to="/sports/prematch"
            cta="sports"
            accentAsHero
          />
        </SwiperSlide>
        <SwiperSlide>
          <PromoHeroSlide
            imageSrc="/hero-slides/live-casino.jpg"
            line1={t('hero.liveCasinoLine1')}
            line1Accent={t('hero.liveCasinoAccent')}
            line2={t('hero.liveCasinoLine2', { percent: HERO_LIVE_CASINO_CASHBACK_PERCENT })}
            to={typePath('live_casino')}
            layout="welcome"
            heroNowrap
            heroCase="title"
            subtitleSize="large"
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
