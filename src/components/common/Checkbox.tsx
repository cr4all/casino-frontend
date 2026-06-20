import type { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

export function Checkbox({ id, label, className = '', disabled, ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`group inline-flex select-none items-center gap-2.5 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className}`}
    >
      <span
        className={`relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-white/25 bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-150 group-has-[:checked]:border-accent-gold group-has-[:checked]:bg-accent-gold group-has-[:checked]:shadow-[0_0_0_1px_rgba(212,175,55,0.25)] group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-accent-gold/40 group-has-[:focus-visible]:ring-offset-2 group-has-[:focus-visible]:ring-offset-background ${
          disabled ? '' : 'group-hover:border-white/40'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          fill="none"
          className="pointer-events-none h-3 w-3 scale-75 text-background opacity-0 transition-all duration-150 group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100"
        >
          <path
            d="M2.5 6.25 5 8.75 9.5 3.75"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={`text-sm leading-none transition-colors duration-150 ${
          disabled ? 'text-muted' : 'text-muted group-hover:text-white/90'
        }`}
      >
        {label}
      </span>
    </label>
  );
}
