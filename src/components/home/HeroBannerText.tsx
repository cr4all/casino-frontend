interface HeroBannerTextProps {
  topLine?: string;
  titleLine?: string;
  heroLine?: string;
  subtitleLine?: string;
  heroVariant?: 'gradient' | 'light';
  heroSize?: 'default' | 'compact';
  badgeGold?: string;
  badgeWhite?: string;
}

export function HeroBannerText({
  topLine,
  titleLine,
  heroLine,
  subtitleLine,
  heroVariant = 'gradient',
  heroSize = 'default',
  badgeGold,
  badgeWhite,
}: HeroBannerTextProps) {
  const heroClass = [
    'hero-banner-text__hero',
    heroVariant === 'light' ? 'hero-banner-text__hero--light' : '',
    heroSize === 'compact' ? 'hero-banner-text__hero--compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="hero-banner-text">
      {topLine && (
        <div className="hero-banner-text__top-row">
          <span className="hero-banner-text__rule" aria-hidden="true" />
          <span className="hero-banner-text__diamond" aria-hidden="true">◆</span>
          <p className="hero-banner-text__top">{topLine}</p>
          <span className="hero-banner-text__diamond" aria-hidden="true">◆</span>
          <span className="hero-banner-text__rule" aria-hidden="true" />
        </div>
      )}

      {titleLine && (
        <div className="hero-banner-text__title-row">
          <span className="hero-banner-text__rule hero-banner-text__rule--gold" aria-hidden="true" />
          <p className="hero-banner-text__title">{titleLine}</p>
          <span className="hero-banner-text__rule hero-banner-text__rule--gold" aria-hidden="true" />
        </div>
      )}

      {heroLine && <p className={heroClass}>{heroLine}</p>}

      {subtitleLine && <p className="hero-banner-text__subtitle">{subtitleLine}</p>}

      {badgeGold && (
        <div className="hero-banner-text__badge hero-banner-text__badge--gold">{badgeGold}</div>
      )}
      {badgeWhite && (
        <div className="hero-banner-text__badge hero-banner-text__badge--white">{badgeWhite}</div>
      )}
    </div>
  );
}
