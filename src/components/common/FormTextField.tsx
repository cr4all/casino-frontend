import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { FieldError, fieldControlClassName } from '@/components/common/FieldError';

type FormTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: ReactNode;
  error?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  leading?: ReactNode;
};

export function FormTextField({
  label,
  error,
  wrapperClassName = '',
  inputClassName = '',
  leading,
  id,
  ...props
}: FormTextFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <div className={leading ? 'relative' : undefined}>
        {leading}
        <input
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`${fieldControlClassName(Boolean(error))} ${leading ? 'pl-9' : ''} ${inputClassName}`.trim()}
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type FormTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  label: ReactNode;
  error?: string;
};

export function FormTextArea({ label, error, id, ...props }: FormTextAreaProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={fieldControlClassName(Boolean(error))}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type FormSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  label: ReactNode;
  error?: string;
};

export function FormSelect({ label, error, id, children, ...props }: FormSelectProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <select
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={fieldControlClassName(Boolean(error))}
      >
        {children}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
