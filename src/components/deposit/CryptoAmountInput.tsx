import { addToAmountInput } from '@/utils/amountInput';

const QUICK_AMOUNTS = [10, 20, 50, 100];

interface CryptoAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currencyLabel?: string;
  amountLabel: string;
  clearLabel: string;
}

export function CryptoAmountInput({
  value,
  onChange,
  currencyLabel,
  amountLabel,
  clearLabel,
}: CryptoAmountInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="deposit-amount" className="block text-xs text-muted">
        {amountLabel}
        {currencyLabel ? ` (${currencyLabel})` : ''}
      </label>

      <div className="flex overflow-hidden rounded-lg border border-white/15 bg-background">
        <input
          id="deposit-amount"
          type="number"
          step="0.0001"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0.00"
        />
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={!value}
          aria-label={clearLabel}
          className="flex w-11 shrink-0 items-center justify-center border-l border-white/15 text-muted transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <span className="text-lg leading-none" aria-hidden="true">×</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onChange(addToAmountInput(value, delta))}
            className="rounded-lg border border-white/10 bg-surface py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent-gold/40 hover:bg-card-hover"
          >
            +{delta}
          </button>
        ))}
      </div>
    </div>
  );
}
