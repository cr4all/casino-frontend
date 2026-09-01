import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const PARTNERS_EMAIL = 'partners@ibets24.com';

function CheckIcon() {
  return (
    <svg className="affiliate-program__check-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.667 5.833L8.333 14.167 3.333 9.167"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommissionCard({
  badge,
  title,
  description,
  points,
  accent,
}: {
  badge: string;
  title: string;
  description: string;
  points: string[];
  accent: 'gold' | 'emerald' | 'violet';
}) {
  return (
    <article className={`affiliate-program__commission-card affiliate-program__commission-card--${accent}`}>
      <span className="affiliate-program__commission-badge">{badge}</span>
      <h3 className="affiliate-program__card-title">{title}</h3>
      <p className="affiliate-program__card-desc">{description}</p>
      <ul className="affiliate-program__point-list">
        {points.map((point) => (
          <li key={point}>
            <CheckIcon />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function BenefitCard({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
  return (
    <article className="affiliate-program__benefit-card">
      <div className="affiliate-program__benefit-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="affiliate-program__card-title">{title}</h3>
      <p className="affiliate-program__card-desc">{description}</p>
    </article>
  );
}

export function AffiliateProgramPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const openModal = useUiStore((s) => s.openModal);

  const handleBecomePartner = () => {
    if (isAuthenticated && user?.role === 'affiliate') {
      return;
    }
    openModal('affiliateRegister');
  };

  const handlePortalLogin = () => {
    if (isAuthenticated && user?.role === 'affiliate') {
      return;
    }
    openModal('login');
  };

  const highlights = [
    t('affiliateProgram.highlightProducts'),
    t('affiliateProgram.highlightPayout'),
    t('affiliateProgram.highlightTracking'),
    t('affiliateProgram.highlightSupport'),
  ];

  const portalFeatures = [
    t('affiliateProgram.portalFeature1'),
    t('affiliateProgram.portalFeature2'),
    t('affiliateProgram.portalFeature3'),
    t('affiliateProgram.portalFeature4'),
    t('affiliateProgram.portalFeature5'),
  ];

  const steps = [
    { title: t('affiliateProgram.step1Title'), desc: t('affiliateProgram.step1Desc') },
    { title: t('affiliateProgram.step2Title'), desc: t('affiliateProgram.step2Desc') },
    { title: t('affiliateProgram.step3Title'), desc: t('affiliateProgram.step3Desc') },
    { title: t('affiliateProgram.step4Title'), desc: t('affiliateProgram.step4Desc') },
  ];

  return (
    <div className="affiliate-program -mx-4 -mt-4 md:-mx-6 md:-mt-6">
      <section className="affiliate-program__hero">
        <div className="affiliate-program__hero-backdrop" aria-hidden="true">
          <div className="affiliate-program__hero-mesh" />
          <div className="affiliate-program__hero-photo affiliate-program__hero-photo--primary" />
          <div className="affiliate-program__hero-photo affiliate-program__hero-photo--secondary" />
          <div className="affiliate-program__hero-rays" />
          <div className="affiliate-program__hero-grid" />
          <div className="affiliate-program__hero-shimmer" />
          <div className="affiliate-program__hero-vignette" />
          <div className="affiliate-program__hero-noise" />
        </div>
        <div className="affiliate-program__hero-glow affiliate-program__hero-glow--left" aria-hidden="true" />
        <div className="affiliate-program__hero-glow affiliate-program__hero-glow--right" aria-hidden="true" />
        <div className="affiliate-program__hero-glow affiliate-program__hero-glow--center" aria-hidden="true" />

        <div className="affiliate-program__hero-inner">
          <span className="affiliate-program__hero-badge">{t('affiliateProgram.heroBadge')}</span>
          <h1 className="affiliate-program__hero-title">{t('affiliateProgram.heroTitle')}</h1>
          <p className="affiliate-program__hero-subtitle">{t('affiliateProgram.heroSubtitle')}</p>

          <div className="affiliate-program__hero-actions">
            {isAuthenticated && user?.role === 'affiliate' ? (
              <Link to="/affiliate">
                <Button variant="gold" className="affiliate-program__cta-btn">
                  {t('affiliate.portal')}
                </Button>
              </Link>
            ) : (
              <Button variant="gold" className="affiliate-program__cta-btn" onClick={handleBecomePartner}>
                {t('affiliateProgram.ctaApply')}
              </Button>
            )}
            {isAuthenticated && user?.role === 'affiliate' ? null : (
              <Button variant="secondary" className="affiliate-program__cta-btn" onClick={handlePortalLogin}>
                {t('affiliateProgram.ctaPortal')}
              </Button>
            )}
          </div>

          <ul className="affiliate-program__highlights">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="affiliate-program__body">
        <section className="affiliate-program__section">
          <div className="affiliate-program__section-head">
            <h2>{t('affiliateProgram.commissionTitle')}</h2>
            <p>{t('affiliateProgram.commissionSubtitle')}</p>
          </div>

          <div className="affiliate-program__commission-grid">
            <CommissionCard
              badge="RevShare"
              accent="gold"
              title={t('affiliateProgram.revshareTitle')}
              description={t('affiliateProgram.revshareDesc')}
              points={[
                t('affiliateProgram.revsharePoint1'),
                t('affiliateProgram.revsharePoint2'),
                t('affiliateProgram.revsharePoint3'),
              ]}
            />
            <CommissionCard
              badge="CPA"
              accent="emerald"
              title={t('affiliateProgram.cpaTitle')}
              description={t('affiliateProgram.cpaDesc')}
              points={[
                t('affiliateProgram.cpaPoint1'),
                t('affiliateProgram.cpaPoint2'),
                t('affiliateProgram.cpaPoint3'),
              ]}
            />
            <CommissionCard
              badge="Hybrid"
              accent="violet"
              title={t('affiliateProgram.hybridTitle')}
              description={t('affiliateProgram.hybridDesc')}
              points={[
                t('affiliateProgram.hybridPoint1'),
                t('affiliateProgram.hybridPoint2'),
                t('affiliateProgram.hybridPoint3'),
              ]}
            />
          </div>
        </section>

        <section className="affiliate-program__section affiliate-program__section--benefits">
          <div className="affiliate-program__section-head">
            <h2>{t('affiliateProgram.benefitsTitle')}</h2>
            <p>{t('affiliateProgram.benefitsSubtitle')}</p>
          </div>

          <div className="affiliate-program__benefits-grid">
            <BenefitCard
              title={t('affiliateProgram.benefit1Title')}
              description={t('affiliateProgram.benefit1Desc')}
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16M4 12h10M4 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <BenefitCard
              title={t('affiliateProgram.benefit2Title')}
              description={t('affiliateProgram.benefit2Desc')}
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <BenefitCard
              title={t('affiliateProgram.benefit3Title')}
              description={t('affiliateProgram.benefit3Desc')}
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="2" />
                </svg>
              }
            />
            <BenefitCard
              title={t('affiliateProgram.benefit4Title')}
              description={t('affiliateProgram.benefit4Desc')}
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <BenefitCard
              title={t('affiliateProgram.benefit5Title')}
              description={t('affiliateProgram.benefit5Desc')}
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7l8-4z" stroke="currentColor" strokeWidth="2" />
                </svg>
              }
            />
            <BenefitCard
              title={t('affiliateProgram.benefit6Title')}
              description={t('affiliateProgram.benefit6Desc')}
              icon={
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 9h16M8 13h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </section>

        <section className="affiliate-program__section">
          <div className="affiliate-program__section-head">
            <h2>{t('affiliateProgram.howTitle')}</h2>
            <p>{t('affiliateProgram.howSubtitle')}</p>
          </div>

          <ol className="affiliate-program__steps">
            {steps.map((step, index) => (
              <li key={step.title} className="affiliate-program__step">
                <span className="affiliate-program__step-num">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="affiliate-program__portal">
          <div className="affiliate-program__portal-copy">
            <h2>{t('affiliateProgram.portalTitle')}</h2>
            <p>{t('affiliateProgram.portalSubtitle')}</p>
            <ul className="affiliate-program__portal-list">
              {portalFeatures.map((feature) => (
                <li key={feature}>
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="affiliate-program__portal-panel" aria-hidden="true">
            <div className="affiliate-program__portal-stat">
              <span>GGR</span>
              <strong>$12,480</strong>
            </div>
            <div className="affiliate-program__portal-stat">
              <span>NGR</span>
              <strong>$9,240</strong>
            </div>
            <div className="affiliate-program__portal-stat affiliate-program__portal-stat--highlight">
              <span>Commission</span>
              <strong>$1,848</strong>
            </div>
            <div className="affiliate-program__portal-chart">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>

        <section className="affiliate-program__business">
          <h2>{t('affiliateProgram.businessTitle')}</h2>
          <p>{t('affiliateProgram.businessDesc')}</p>
          <a
            href={`mailto:${PARTNERS_EMAIL}?subject=${encodeURIComponent('B2B Partnership Proposal')}`}
            className="affiliate-program__business-link"
          >
            {t('affiliateProgram.businessCta')} →
          </a>
        </section>

        <section className="affiliate-program__cta">
          <h2>{t('affiliateProgram.ctaTitle')}</h2>
          <p>{t('affiliateProgram.ctaSubtitle')}</p>
          {isAuthenticated && user?.role === 'affiliate' ? (
            <Link to="/affiliate" className="affiliate-program__email">
              {t('affiliate.portal')}
            </Link>
          ) : (
            <Button variant="gold" className="mt-4" onClick={handleBecomePartner}>
              {t('affiliateProgram.ctaApply')}
            </Button>
          )}
          <a href={`mailto:${PARTNERS_EMAIL}`} className="mt-4 block text-sm text-muted hover:text-white">
            {t('affiliateProgram.partnersEmail')}
          </a>
          <p className="affiliate-program__support-note">{t('affiliateProgram.supportNote')}</p>
        </section>

        <div className="affiliate-program__footer-link">
          <Link to="/" className="text-sm text-accent-gold hover:underline">
            {t('affiliateProgram.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
