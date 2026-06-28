import { useState, type InputHTMLAttributes } from 'react';
import { FieldError, fieldControlClassName } from '@/components/common/FieldError';
import { useTranslation } from '@/hooks/useTranslation';

interface CopyableInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  copyAriaLabel?: string;
  error?: string;
}

export function CopyableInput({ label, copyAriaLabel, value, error, id, ...props }: CopyableInputProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const textValue = typeof value === 'string' ? value : String(value ?? '');
  const errorId = error && id ? `${id}-error` : undefined;

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
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`${fieldControlClassName(Boolean(error))} pr-10`}
        />
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
      <FieldError id={errorId} message={error} />
    </div>
  );
}
