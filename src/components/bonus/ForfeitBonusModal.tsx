import type { ActiveBonus } from '@/api/bonus.api';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

interface ForfeitBonusModalProps {
  bonus: ActiveBonus | null;
  isOpen: boolean;
  submitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

function WageringSummary({ required, wagered }: { required: string; wagered: string }) {
  const { t } = useTranslation();
  const req = parseFloat(required) || 1;
  const wag = parseFloat(wagered) || 0;
  const pct = Math.min(100, (wag / req) * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{t('wallet.forfeitBonusWageringLabel')}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-accent-purple transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted">
        {formatBalance(wagered)} / {formatBalance(required)}
      </p>
    </div>
  );
}

export function ForfeitBonusModal({
  bonus,
  isOpen,
  submitting,
  errorMessage,
  onConfirm,
  onClose,
}: ForfeitBonusModalProps) {
  const { t } = useTranslation();

  if (!bonus) {
    return null;
  }

  const name = bonus.policy_name ?? `#${bonus.id}`;
  const isFreeSpin = bonus.type === 'free_spin';
  const showAmount = !isFreeSpin || parseFloat(bonus.amount) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => undefined : onClose}
      title={t('wallet.forfeitBonusTitle')}
    >
      <div className="space-y-4">
        <p className="text-sm text-white">
          {t('wallet.forfeitBonusConfirm', { name })}
        </p>

        <div className="space-y-3 rounded-lg border border-white/10 bg-surface/60 px-4 py-3">
          {showAmount && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{t('wallet.forfeitBonusAmountLabel')}</span>
              <span className="font-mono font-medium text-accent-gold">
                {formatBalance(bonus.amount)}
              </span>
            </div>
          )}

          {isFreeSpin && bonus.spins_remaining != null && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{t('wallet.forfeitBonusFreeSpinsLabel')}</span>
              <span className="font-mono font-medium text-white">
                {bonus.spins_remaining}
                {bonus.spin_count != null ? ` / ${bonus.spin_count}` : ''}
              </span>
            </div>
          )}

          {bonus.wagering && (
            <WageringSummary
              required={bonus.wagering.required}
              wagered={bonus.wagering.wagered}
            />
          )}
        </div>

        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {t('wallet.forfeitBonusWarning')}
        </p>

        {errorMessage && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400 whitespace-pre-line">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={submitting}
            onClick={onClose}
          >
            {t('wallet.forfeitBonusCancelCta')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? t('common.loading') : t('wallet.forfeitBonusConfirmCta')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
