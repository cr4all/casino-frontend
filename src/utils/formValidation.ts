export type FieldErrors = Record<string, string>;

export function collectFieldErrors(
  checks: Array<[string, string | undefined]>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const [field, message] of checks) {
    if (message) {
      errors[field] = message;
    }
  }
  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function omitFieldError(errors: FieldErrors, field: string): FieldErrors {
  if (!errors[field]) {
    return errors;
  }
  const next = { ...errors };
  delete next[field];
  return next;
}

export function requiredValue(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
