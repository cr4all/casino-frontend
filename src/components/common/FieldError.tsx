interface FieldErrorProps {
  id?: string;
  message?: string;
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-1 text-xs text-red-400" role="alert">
      {message}
    </p>
  );
}

export const baseFieldClassName =
  'w-full rounded-md border bg-card px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none';

export function fieldControlClassName(hasError: boolean, extra = ''): string {
  const borderClass = hasError
    ? 'border-red-400/70 focus:border-red-400'
    : 'border-white/10 focus:border-accent';

  return [baseFieldClassName, borderClass, extra].filter(Boolean).join(' ');
}
