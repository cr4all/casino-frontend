import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent-gold hover:bg-accent-gold/90 text-background font-bold',
  secondary: 'bg-card hover:bg-card-hover text-white border border-white/10',
  ghost: 'bg-transparent hover:bg-white/5 text-white',
  gold: 'bg-accent-gold hover:bg-accent-gold/90 text-background font-bold shadow-gold',
};

export function Button({
  variant = 'primary',
  children,
  fullWidth,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
