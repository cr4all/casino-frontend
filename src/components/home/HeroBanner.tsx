import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';

export function HeroBanner() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className="hero-banner relative overflow-hidden rounded-xl border border-white/[0.08]">
      <img
        src="/hero-banner-bg.png"
        alt=""
        className="hero-banner__bg max-md:hidden"
        width={1920}
        height={500}
        loading="eager"
      />

      <img
        src="/hero-dealer-layer.png"
        alt=""
        className="hero-banner__dealer max-md:hidden"
        loading="eager"
      />

      <div className="hero-banner__gold-overlay max-md:hidden" aria-hidden="true" />

      <div className="hero-banner__text-panel max-md:hidden" aria-hidden="true">
        <div className="hero-banner__text-panel-sparks">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="hero-banner__dark-spark" style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      </div>

      <div className="hero-banner__sparks max-md:hidden" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className="hero-banner__spark" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>

      <div className="hero-banner__content-wrap relative z-10 flex items-center">
        <div className="hero-banner__content px-6 py-6 md:px-10 md:py-8">
          <h1 className="text-xl font-bold uppercase leading-tight tracking-wide text-white md:text-2xl lg:text-4xl">
            {t('hero.welcome')}{' '}
            <span className="text-accent-gold">iBets24</span>
            <br />
            {t('hero.bestExperience')}
          </h1>
          <Link to={isAuthenticated ? '/category/live' : '/category/slots'}>
            <Button
              variant="gold"
              className="mt-5 rounded-lg px-8 py-3 text-sm font-bold uppercase tracking-wide md:text-base"
            >
              {t('hero.playNow')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
