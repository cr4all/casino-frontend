import { useCallback, useRef, useState } from 'react';
import { bonusApi, type ActiveBonus } from '@/api/bonus.api';
import { useTranslation } from '@/hooks/useTranslation';
import { useBonusStore } from '@/stores/bonusStore';
import { useWalletStore } from '@/stores/walletStore';
import { getApiErrorMessage } from '@/utils/apiError';

interface UseForfeitBonusOptions {
  onSuccess?: () => void | Promise<void>;
}

export function useForfeitBonus(options: UseForfeitBonusOptions = {}) {
  const { t } = useTranslation();
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const fetchBonusState = useBonusStore((s) => s.fetchBonusState);
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;

  const [targetBonus, setTargetBonus] = useState<ActiveBonus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestForfeit = useCallback((bonus: ActiveBonus) => {
    setTargetBonus(bonus);
    setErrorMessage(null);
  }, []);

  const closeForfeit = useCallback(() => {
    if (submitting) return;
    setTargetBonus(null);
    setErrorMessage(null);
  }, [submitting]);

  const confirmForfeit = useCallback(async () => {
    if (!targetBonus || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await bonusApi.forfeit(targetBonus.id);
      await fetchBalance();
      await fetchBonusState();
      await onSuccessRef.current?.();
      setTargetBonus(null);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, t('wallet.forfeitBonusFailed')));
    } finally {
      setSubmitting(false);
    }
  }, [targetBonus, submitting, fetchBalance, fetchBonusState, t]);

  return {
    targetBonus,
    isOpen: targetBonus !== null,
    submitting,
    errorMessage,
    requestForfeit,
    confirmForfeit,
    closeForfeit,
  };
}
