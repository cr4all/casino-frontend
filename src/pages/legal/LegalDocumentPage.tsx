import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi, type WithdrawalVerificationLimits } from '@/api/payment.api';
import { getLegalPageContent, type LegalPageId } from '@/content/legal';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/stores/languageStore';
import { formatPaymentLimit } from '@/utils/formatBalance';

interface LegalDocumentPageProps {
  pageId: LegalPageId;
}

function applyWithdrawalLimitPlaceholders(
  text: string,
  limits: WithdrawalVerificationLimits | null,
): string {
  if (!limits) {
    return text
      .replaceAll('{{email_verified_limit}}', '…')
      .replaceAll('{{phone_verified_limit}}', '…')
      .replaceAll('{{combined_verified_limit}}', '…');
  }

  const email = formatPaymentLimit(limits.email_verified_limit);
  const phone = formatPaymentLimit(limits.phone_verified_limit);
  const combined = formatPaymentLimit(
    (parseFloat(limits.email_verified_limit) + parseFloat(limits.phone_verified_limit)).toFixed(4),
  );

  return text
    .replaceAll('{{email_verified_limit}}', email)
    .replaceAll('{{phone_verified_limit}}', phone)
    .replaceAll('{{combined_verified_limit}}', combined);
}

export function LegalDocumentPage({ pageId }: LegalDocumentPageProps) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const content = getLegalPageContent(language, pageId);
  const [withdrawalLimits, setWithdrawalLimits] = useState<WithdrawalVerificationLimits | null>(null);

  useEffect(() => {
    if (pageId !== 'faq') return;

    let cancelled = false;
    paymentApi
      .getWithdrawalVerificationLimits()
      .then((limits) => {
        if (!cancelled) setWithdrawalLimits(limits);
      })
      .catch(() => {
        if (!cancelled) setWithdrawalLimits(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pageId]);

  return (
    <div key={language} className="mx-auto max-w-3xl py-8">
      <h1 className="mb-3 text-2xl font-bold text-white">{content.title}</h1>
      <p className="mb-8 text-sm leading-relaxed text-muted">{content.intro}</p>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-white">{section.title}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => {
                const text =
                  pageId === 'faq'
                    ? applyWithdrawalLimitPlaceholders(paragraph, withdrawalLimits)
                    : paragraph;

                return (
                  <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-muted">
                    {text}
                  </p>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-white/10 pt-6">
        <Link to="/" className="text-sm text-accent-gold hover:underline">
          {t('legal.backHome')}
        </Link>
      </div>
    </div>
  );
}
