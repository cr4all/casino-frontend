import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Logo } from '@/components/common/Logo';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-white/5 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <Logo height={28} className="mb-3" />
            <ul className="space-y-2">
              <li><Link to="/category/slots" className="text-xs text-muted hover:text-white transition-colors">{t('footer.slots')}</Link></li>
              <li><Link to="/category/live" className="text-xs text-muted hover:text-white transition-colors">{t('footer.liveCasino')}</Link></li>
              <li><Link to="/category/jackpots" className="text-xs text-muted hover:text-white transition-colors">{t('footer.jackpots')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">{t('footer.account')}</h4>
            <ul className="space-y-2">
              <li><Link to="/deposit" className="text-xs text-muted hover:text-white transition-colors">{t('nav.depositLabel')}</Link></li>
              <li><Link to="/withdraw" className="text-xs text-muted hover:text-white transition-colors">{t('nav.withdrawLabel')}</Link></li>
              <li><Link to="/bonus" className="text-xs text-muted hover:text-white transition-colors">{t('nav.bonusesLabel')}</Link></li>
              <li><Link to="/bets" className="text-xs text-muted hover:text-white transition-colors">{t('betHistory.title')}</Link></li>
              <li><Link to="/transactions" className="text-xs text-muted hover:text-white transition-colors">{t('nav.transactions')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link to="/notifications" className="text-xs text-muted hover:text-white transition-colors">{t('footer.messages')}</Link></li>
              <li><a href="mailto:support@ibets24.com" className="text-xs text-muted hover:text-white transition-colors">support@ibets24.com</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li><span className="text-xs text-muted">{t('footer.terms')}</span></li>
              <li><span className="text-xs text-muted">{t('footer.privacy')}</span></li>
              <li><span className="text-xs text-muted">{t('footer.responsibleGaming')}</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-muted">{t('footer.disclaimer')}</p>
          <p className="mt-2 text-xs text-muted/60">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
