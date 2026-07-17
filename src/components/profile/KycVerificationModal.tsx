import { useCallback, useEffect, useState } from 'react';
import SumsubWebSdk from '@sumsub/websdk-react';
import { Modal } from '@/components/common/Modal';
import { ProfileService } from '@/services/ProfileService';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import type { PlayerProfile } from '@/types';

interface KycVerificationModalProps {
  isOpen: boolean;
  profile: PlayerProfile | null;
  onClose: () => void;
  onUpdated: (profile: PlayerProfile) => void;
}

function normalizeSumSubLang(language: string | null | undefined): string {
  if (!language) return 'en';
  return language.split('-')[0]?.toLowerCase() || 'en';
}

export function KycVerificationModal({
  isOpen,
  profile,
  onClose,
  onUpdated,
}: KycVerificationModalProps) {
  const { t } = useTranslation();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshProfile = useCallback(async () => {
    const updated = await ProfileService.refreshProfileAfterKyc(profile?.kyc_status);
    onUpdated(updated);
    return updated;
  }, [onUpdated, profile?.kyc_status]);

  const loadAccessToken = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await ProfileService.createKycAccessToken(profile?.kyc_status ?? 'pending');
      setAccessToken(result.token);
    } catch (err) {
      setAccessToken(null);
      setError(getApiErrorMessage(err, t('profile.kycFailed')));
    } finally {
      setLoading(false);
    }
  }, [profile?.kyc_status, t]);

  useEffect(() => {
    if (!isOpen) {
      setAccessToken(null);
      setError('');
      setLoading(false);
      return;
    }

    void loadAccessToken();
  }, [isOpen, loadAccessToken]);

  const handleExpiration = async () => {
    const result = await ProfileService.refreshKycAccessToken();
    return result.token;
  };

  const handleMessage = (type: string, payload: unknown) => {
    if (
      type === 'idCheck.onApplicantSubmitted'
      || type === 'idCheck.applicantStatusChanged'
      || type === 'idCheck.onStepCompleted'
    ) {
      void refreshProfile();

      const reviewAnswer = (payload as { reviewResult?: { reviewAnswer?: string } })?.reviewResult?.reviewAnswer;
      if (reviewAnswer === 'GREEN') {
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.verificationTitleKyc')} size="xl">
      {loading && (
        <p className="mb-4 text-sm text-muted">{t('profile.kycLoading')}</p>
      )}

      {error && (
        <p className="mb-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
      )}

      {accessToken && !error && (
        <div className="min-h-[320px] rounded-lg border border-white/10 bg-background">
          <SumsubWebSdk
            accessToken={accessToken}
            expirationHandler={handleExpiration}
            config={{
              lang: normalizeSumSubLang(profile?.language),
              email: profile?.email,
              phone: profile?.phone ?? undefined,
            }}
            options={{ addViewportTag: false, adaptIframeHeight: true }}
            onMessage={handleMessage}
            onError={() => setError(t('profile.kycFailed'))}
          />
        </div>
      )}

      <p className="mt-4 text-xs text-muted">{t('profile.kycHint')}</p>
    </Modal>
  );
}
