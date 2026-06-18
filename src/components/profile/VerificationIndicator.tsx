import { useTranslation } from '@/hooks/useTranslation';

interface VerificationIndicatorProps {
  verified: boolean;
  onVerify?: () => void;
}

export function VerificationIndicator({ verified, onVerify }: VerificationIndicatorProps) {
  const { t } = useTranslation();

  if (verified) {
    return (
      <span
        className="inline-flex shrink-0 items-center text-accent-gold"
        title={t('profile.verified')}
        aria-label={t('profile.verified')}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        {t('profile.notVerified')}
      </span>
      {onVerify ? (
        <button
          type="button"
          onClick={onVerify}
          className="text-[10px] font-semibold uppercase tracking-wide text-accent hover:text-accent-gold hover:underline"
        >
          {t('profile.verifyNow')}
        </button>
      ) : null}
    </span>
  );
}
