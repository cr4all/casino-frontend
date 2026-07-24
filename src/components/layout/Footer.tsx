import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { PaymentMethodsMarquee } from '@/components/layout/PaymentMethodsMarquee';
import { Logo } from '@/components/common/Logo';
import { useAuthStore } from '@/stores/authStore';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';
import { useRequestLiveChat } from '@/hooks/useRequestLiveChat';
import { typePath } from '@/stores/gameStore';

const SUPPORT_EMAIL = 'support@ibets24.com';
const PARTNERS_EMAIL = 'partners@ibets24.com';

/** Regulator verification seals — VALID / Click to verify. */
const LICENSE_SEALS = [
  {
    key: 'licenseUkGamblingCommission' as const,
    href: 'https://www.gamblingcommission.gov.uk/licensees-and-businesses/licences-and-fees/sector/remote',
    icon: '/trust-badges/ukgc-seal.png',
    ariaKey: 'licenseUkVerifyAria' as const,
  },
  {
    key: 'licenseAnjouan' as const,
    href: 'https://anjouangaming.com/license-register/',
    icon: '/trust-badges/anjouan-seal.png?v=2',
    ariaKey: 'licenseAnjouanVerifyAria' as const,
  },
] as const;

interface FooterLinkListProps {
  title: string;
  children: ReactNode;
}

function FooterLinkList({ title, children }: FooterLinkListProps) {
  return (
    <div className="site-footer__col">
      <h2 className="site-footer__heading">{title}</h2>
      <nav className="site-footer__col-nav" aria-label={title}>
        {children}
      </nav>
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openSettings = useCookieConsentStore((s) => s.openSettings);
  const requestLiveChat = useRequestLiveChat();

  return (
    <footer className={`site-footer mt-auto ${isAuthenticated ? 'has-mobile-wallet-bar lg:pb-0' : ''}`}>
      <div className="site-footer__columns">
        <div className="site-footer__inner">
          <div className="site-footer__grid">
            <div className="site-footer__col">
              <Logo height={36} className="mb-4" />
              <nav className="site-footer__col-nav" aria-label={t('footer.slots')}>
                <Link to={typePath('slot')} className="site-footer__col-link">
                  {t('footer.slots')}
                </Link>
                <Link to={typePath('live_casino')} className="site-footer__col-link">
                  {t('footer.liveCasino')}
                </Link>
              </nav>
            </div>

            <FooterLinkList title={t('footer.account')}>
              <Link to="/deposit" className="site-footer__col-link">{t('nav.depositLabel')}</Link>
              <Link to="/withdraw" className="site-footer__col-link">{t('nav.withdrawLabel')}</Link>
              <Link to="/bonus" className="site-footer__col-link">{t('nav.bonusesLabel')}</Link>
              <Link to="/transactions" className="site-footer__col-link">{t('nav.transactions')}</Link>
            </FooterLinkList>

            <FooterLinkList title={t('footer.support')}>
              <button type="button" onClick={requestLiveChat} className="site-footer__col-link">
                {t('footer.messages')}
              </button>
              <Link to="/support-tickets" className="site-footer__col-link">{t('footer.tickets')}</Link>
              <Link to="/faq" className="site-footer__col-link">{t('footer.faq')}</Link>
              <Link to="/contact" className="site-footer__col-link">{t('footer.contact')}</Link>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="site-footer__col-link site-footer__email">
                {SUPPORT_EMAIL}
              </a>
            </FooterLinkList>

            <FooterLinkList title={t('footer.partners')}>
              <Link to="/partners" className="site-footer__col-link">{t('footer.affiliateProgram')}</Link>
              <Link to="/partners" className="site-footer__col-link">{t('footer.becomePartner')}</Link>
              <a href={`mailto:${PARTNERS_EMAIL}`} className="site-footer__col-link site-footer__email">
                {PARTNERS_EMAIL}
              </a>
            </FooterLinkList>

            <FooterLinkList title={t('footer.legal')}>
              <Link to="/about" className="site-footer__col-link">{t('footer.about')}</Link>
              <Link to="/terms" className="site-footer__col-link">{t('footer.terms')}</Link>
              <Link to="/privacy" className="site-footer__col-link">{t('footer.privacy')}</Link>
              <Link to="/responsible-gaming" className="site-footer__col-link">
                {t('footer.responsibleGaming')}
              </Link>
              <Link to="/aml" className="site-footer__col-link">{t('footer.aml')}</Link>
              <Link to="/cookies" className="site-footer__col-link">{t('cookies.policyLink')}</Link>
              <button type="button" onClick={openSettings} className="site-footer__col-link">
                {t('cookies.settings')}
              </button>
            </FooterLinkList>
          </div>
        </div>
      </div>

      <div className="site-footer__dark">
        <div className="site-footer__license">
          <Logo height={40} className="site-footer__license-logo" />
          <nav className="site-footer__seals" aria-label={t('footer.licensing')}>
            {LICENSE_SEALS.map((seal) => (
              <a
                key={seal.key}
                href={seal.href}
                className="site-footer__seal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`footer.${seal.ariaKey}`)}
              >
                <span className="site-footer__seal-icon-wrap">
                  <img
                    src={seal.icon}
                    alt=""
                    className="site-footer__seal-icon"
                    width={72}
                    height={56}
                  />
                  <span className="site-footer__seal-check" aria-hidden="true">
                    ✓
                  </span>
                </span>
                <span className="site-footer__seal-name">{t(`footer.${seal.key}`)}</span>
                <span className="site-footer__seal-valid">{t('footer.licenseValid')}</span>
                <span className="site-footer__seal-hint">{t('footer.licenseClickToVerify')}</span>
              </a>
            ))}
          </nav>
        </div>
        <p className="site-footer__disclaimer">{t('footer.disclaimer')}</p>
        <p className="site-footer__copyright">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>

      <PaymentMethodsMarquee />
    </footer>
  );
}
