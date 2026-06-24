import { useTranslation } from '@/hooks/useTranslation';
import type { PaymentKind } from '@/utils/depositOptions';

type DepositStep = 1 | 2 | 3;

interface DepositStepIndicatorProps {
  step: DepositStep;
  selectedKind: PaymentKind | null;
}

export function DepositStepIndicator({ step, selectedKind }: DepositStepIndicatorProps) {
  const { t } = useTranslation();
  const skipOptionStep = selectedKind === 'manual';

  const steps = [
    { num: 1 as const, label: t('deposit.stepMethod') },
    { num: 2 as const, label: t('deposit.stepOption') },
    { num: 3 as const, label: t('deposit.stepAmount') },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((item, index) => {
        const isSkipped = skipOptionStep && item.num === 2;
        const isActive = step === item.num;
        const isCompleted = step > item.num || (skipOptionStep && item.num === 2 && step === 3);

        return (
          <div key={item.num} className="flex items-center gap-2 sm:gap-4">
            {index > 0 && (
              <div
                className={`hidden h-px w-6 sm:block sm:w-10 ${
                  isSkipped ? 'border-t border-dashed border-white/20' : 'bg-white/20'
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isSkipped
                    ? 'border border-dashed border-white/20 text-white/30'
                    : isActive
                      ? 'bg-accent-gold text-background'
                      : isCompleted
                        ? 'bg-accent-gold/20 text-accent-gold'
                        : 'bg-white/10 text-muted'
                }`}
              >
                {item.num}
              </div>
              <span
                className={`hidden text-[10px] sm:block ${
                  isSkipped ? 'text-white/30 line-through' : isActive ? 'text-accent-gold' : 'text-muted'
                }`}
              >
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
