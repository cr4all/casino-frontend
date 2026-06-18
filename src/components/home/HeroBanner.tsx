import { type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { typePath } from '@/stores/gameStore';
import { Button } from '@/components/common/Button';
import { FirstDepositBonusText, firstDepositBannerAriaLabel } from '@/components/home/FirstDepositBonusText';
import { HeroBannerText } from '@/components/home/HeroBannerText';

function HeroCtaButton({ to }: { to: string }) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Link to={to} className="hero-banner-text__cta-link">
      <Button variant="gold" className="hero-banner-text__cta">
        {isAuthenticated ? t('hero.playNow') : t('hero.registerPromo')}
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
        <HeroCtaButton to="/deposit" />
      </HeroSlideContent>
    </div>
  );
}

interface PromoHeroSlideProps {
  imageSrc: string;
  line1: string;
  line1Accent: string;
  line2: string;
  to: string;
}

function PromoHeroSlide({ imageSrc, line1, line1Accent, line2, to }: PromoHeroSlideProps) {
  return (
    <div className="hero-banner hero-banner--promo relative overflow-hidden">
      <img src={imageSrc} alt="" className="hero-banner__scene" loading="lazy" />

      <HeroSlideDecorations showOnMobile />

      <HeroSlideContent>
        <HeroBannerText topLine={line1} titleLine={line1Accent} heroLine={line2} />
        <HeroCtaButton to={to} />
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
  const { t } = useTranslation();

  return (
    <section className="hero-slider" aria-label="Promotions">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
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
            line2={t('hero.pragmaticLine2')}
            to={typePath('slot')}
          />
        </SwiperSlide>
        <SwiperSlide>
          <PromoHeroSlide
            imageSrc="/hero-slides/live-casino.jpg"
            line1={t('hero.liveCasinoLine1')}
            line1Accent={t('hero.liveCasinoAccent')}
            line2={t('hero.liveCasinoLine2')}
            to={typePath('live_casino')}
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
