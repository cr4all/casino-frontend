import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { platformApi } from '@/api/platform.api';
import { Button } from '@/components/common/Button';
import { FirstDepositBonusText, firstDepositBannerAriaLabel } from '@/components/home/FirstDepositBonusText';
import { HeroBannerText } from '@/components/home/HeroBannerText';
import {
  HERO_LIVE_CASINO_CASHBACK_PERCENT,
  HERO_PRAGMATIC_CASHBACK_PERCENT,
} from '@/constants/heroBannerPromo';
import { resolveAssetUrl } from '@/data/resolveAssetUrl';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { typePath } from '@/stores/gameStore';
import { isRtlLanguage } from '@/stores/languageStore';
import { usePlatformSectionStore } from '@/stores/platformSectionStore';
import { useUiStore } from '@/stores/uiStore';
import type { HeroBannerSlide, HeroBannersResponse } from '@/types';
import { handleExternalLinkClick } from '@/utils/openExternalUrl';

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

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

function heroSlideImageUrl(slide: HeroBannerSlide, isMobile: boolean): string | undefined {
  const desktopUrl = resolveAssetUrl(slide.image_url);
  const mobileUrl = resolveAssetUrl(slide.mobile_image_url);
  return (isMobile ? mobileUrl ?? desktopUrl : desktopUrl ?? mobileUrl) || undefined;
}

function isVisibleHeroSlide(slide: HeroBannerSlide): boolean {
  if (slide.enabled === false) return false;
  return Boolean(resolveAssetUrl(slide.image_url) || resolveAssetUrl(slide.mobile_image_url));
}

const heroSlideLinkClass =
  'absolute inset-0 z-20 cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-gold';

function ApiHeroSlide({ slide }: { slide: HeroBannerSlide }) {
  const isMobile = useIsMobile();
  const imageUrl = heroSlideImageUrl(slide, isMobile);

  return (
    <div className="hero-banner hero-banner--image-only relative overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="hero-banner__scene hero-banner__scene--full"
          loading="eager"
        />
      ) : null}
      {slide.link_url ? (
        isExternalUrl(slide.link_url) ? (
          <a
            href={slide.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className={heroSlideLinkClass}
            onClick={handleExternalLinkClick}
          />
        ) : (
          <Link to={slide.link_url} className={heroSlideLinkClass} />
        )
      ) : null}
    </div>
  );
}

function HeroBannerSkeleton() {
  return (
    <section className="hero-slider" aria-hidden="true">
      <div className="hero-slider__swiper overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] animate-pulse" />
    </section>
  );
}

const DEFAULT_SLIDE_COUNT = 5;

export function HeroBanner() {
  const { t, language } = useTranslation();
  const isRtl = isRtlLanguage(language);
  const [config, setConfig] = useState<HeroBannersResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    platformApi
      .getBanners()
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({ slides: [], show_default_hero: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (config === null) {
    return <HeroBannerSkeleton />;
  }

  const showDefault = config.show_default_hero !== false;
  const customSlides = config.slides.filter(isVisibleHeroSlide);
  const slideCount = (showDefault ? DEFAULT_SLIDE_COUNT : 0) + customSlides.length;

  if (slideCount === 0) {
    return null;
  }

  return (
    <section className="hero-slider" aria-label="Promotions">
      <Swiper
        key={`${language}-${showDefault}-${customSlides.length}`}
        dir={isRtl ? 'rtl' : 'ltr'}
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={slideCount > 1}
        autoHeight={false}
        className="hero-slider__swiper overflow-hidden rounded-xl border border-white/[0.08]"
      >
        {showDefault ? (
          <SwiperSlide key="default-welcome">
            <WelcomeHeroSlide />
          </SwiperSlide>
        ) : null}
        {showDefault ? (
          <SwiperSlide key="default-first-deposit">
            <FirstDepositHeroSlide backgroundSrc="/hero-slides/first-deposit-bonus-bg.jpg" />
          </SwiperSlide>
        ) : null}
        {showDefault ? (
          <SwiperSlide key="default-pragmatic">
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
        ) : null}
        {showDefault ? (
          <SwiperSlide key="default-sportsbook">
            <PromoHeroSlide
              imageSrc="/hero-slides/sportsbook.jpg"
              line1={t('hero.sportsbookLine1')}
              line1Accent={t('hero.sportsbookAccent')}
              to="/sports/prematch"
              cta="sports"
              accentAsHero
            />
          </SwiperSlide>
        ) : null}
        {showDefault ? (
          <SwiperSlide key="default-live-casino">
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
        ) : null}
        {customSlides.map((slide, index) => (
          <SwiperSlide key={`custom-${slide.sort_order}-${slide.image_url}-${index}`}>
            <ApiHeroSlide slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
