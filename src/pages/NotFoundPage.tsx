import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { useTranslation } from '@/hooks/useTranslation';

export function NotFoundPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex min-h-[min(70vh,640px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg text-center"
      >
        <div className="mx-auto mb-8 flex justify-center">
          <Logo height={40} />
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-card p-8 shadow-card md:p-10"
          role="alert"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-gold/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl"
            aria-hidden
          />

          <p className="text-6xl font-black tracking-tight text-accent-gold md:text-7xl">
            {t('notFound.code')}
          </p>
          <h1 className="mt-3 text-xl font-bold text-white md:text-2xl">{t('notFound.title')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('notFound.description')}</p>

          {path.length > 1 && (
            <p className="mt-4 rounded-lg border border-white/5 bg-background/60 px-3 py-2 text-xs text-muted">
              <span className="text-white/70">{t('notFound.pathHint')}</span>{' '}
              <code className="font-mono text-accent-gold/90">{path}</code>
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-accent-gold px-6 py-2.5 text-sm font-bold text-background transition-colors hover:bg-accent-gold/90"
            >
              {t('notFound.backHome')}
            </Link>
            <Link
              to="/category/all"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-surface px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent-gold/40 hover:bg-white/5"
            >
              {t('notFound.browseGames')}
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted">
            {t('notFound.helpText')}{' '}
            <Link to="/faq" className="text-accent-gold hover:underline">
              {t('footer.faq')}
            </Link>
            {' · '}
            <Link to="/contact" className="text-accent-gold hover:underline">
              {t('footer.contact')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
