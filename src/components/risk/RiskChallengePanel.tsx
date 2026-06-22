import { useRef } from 'react';
import { TurnstileWidget, type TurnstileWidgetHandle } from '@/components/risk/TurnstileWidget';
import { useTranslation } from '@/hooks/useTranslation';
import { isTurnstileConfigured } from '@/lib/turnstileConfig';

interface RiskChallengePanelProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onRegisterReset?: (reset: () => void) => void;
  error?: string;
}

export function RiskChallengePanel({
  onSuccess,
  onError,
  onRegisterReset,
  error,
}: RiskChallengePanelProps) {
  const { t } = useTranslation();
  const widgetRef = useRef<TurnstileWidgetHandle>(null);

  const handleRegisterReset = (reset: () => void) => {
    onRegisterReset?.(() => widgetRef.current?.reset() ?? reset());
  };

  return (
    <div className="space-y-3 rounded-md border border-accent/30 bg-accent/5 px-3 py-3">
      <div>
        <p className="text-sm font-semibold text-white">{t('risk.challengeTitle')}</p>
        <p className="mt-1 text-xs text-muted">{t('risk.challengeHint')}</p>
      </div>

      {isTurnstileConfigured() ? (
        <TurnstileWidget
          ref={widgetRef}
          onSuccess={onSuccess}
          onError={onError}
          onExpire={onError}
          onRegisterReset={handleRegisterReset}
        />
      ) : (
        <p className="text-xs text-accent">{t('auth.riskChallenge')}</p>
      )}

      {error && (
        <p className="text-xs text-accent">{error}</p>
      )}
    </div>
  );
}
