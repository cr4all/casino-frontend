import { useState, type InputHTMLAttributes } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const inputClassName =
  'w-full rounded-md border border-white/10 bg-card px-3 py-2.5 pr-10 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none';

interface CopyableInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  copyAriaLabel?: string;
}

export function CopyableInput({ label, copyAriaLabel, value, ...props }: CopyableInputProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const textValue = typeof value === 'string' ? value : String(value ?? '');

  const handleCopy = async () => {
    if (!textValue.trim()) return;

    try {
      await navigator.clipboard.writeText(textValue.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  };

  return (
    <div>
      <label htmlFor={props.id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <div className="relative">
        <input {...props} value={value} className={inputClassName} />
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={!textValue.trim()}
          aria-label={copyAriaLabel ?? t('common.copy')}
          title={copied ? t('common.copied') : t('common.copy')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-accent-gold disabled:opacity-40 disabled:hover:text-muted"
        >
          {copied ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
