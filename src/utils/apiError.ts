type ValidationErrors = Record<string, string[]>;

function collectValidationMessages(data: unknown): string[] {
  const messages: string[] = [];

  if (!data || typeof data !== 'object') {
    return messages;
  }

  const record = data as Record<string, unknown>;

  if (record.error && typeof record.error === 'object') {
    const error = record.error as { message?: string; details?: ValidationErrors };

    if (error.details) {
      for (const fieldErrors of Object.values(error.details)) {
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors.filter((message) => typeof message === 'string'));
        }
      }
    }

    if (messages.length === 0 && typeof error.message === 'string' && error.message.trim() !== '') {
      messages.push(error.message);
    }
  }

  if (record.errors && typeof record.errors === 'object') {
    const errors = record.errors as ValidationErrors;

    for (const fieldErrors of Object.values(errors)) {
      if (Array.isArray(fieldErrors)) {
        messages.push(...fieldErrors.filter((message) => typeof message === 'string'));
      }
    }
  }

  if (
    messages.length === 0
    && typeof record.message === 'string'
    && record.message.trim() !== ''
    && record.message !== 'The given data was invalid.'
  ) {
    messages.push(record.message);
  }

  return messages;
}

export function getApiValidationFieldErrors(err: unknown): Record<string, string> {
  const apiErr = err as { response?: { data?: unknown } };
  const data = apiErr.response?.data;

  if (!data || typeof data !== 'object') {
    return {};
  }

  const record = data as Record<string, unknown>;
  const result: Record<string, string> = {};

  const assignErrors = (errors: ValidationErrors) => {
    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages) && typeof messages[0] === 'string') {
        result[field] = messages[0];
      }
    }
  };

  if (record.errors && typeof record.errors === 'object') {
    assignErrors(record.errors as ValidationErrors);
  }

  if (record.error && typeof record.error === 'object') {
    const error = record.error as { details?: ValidationErrors };
    if (error.details) {
      assignErrors(error.details);
    }
  }

  return result;
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const apiErr = err as { response?: { data?: unknown } };
  const messages = collectValidationMessages(apiErr.response?.data);

  if (messages.length > 0) {
    return [...new Set(messages)].join('\n');
  }

  return fallback;
}

export function getApiErrorCode(err: unknown): string | undefined {
  const apiErr = err as { response?: { data?: unknown } };
  const data = apiErr.response?.data;

  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;

  if (record.error && typeof record.error === 'object') {
    const error = record.error as { code?: string };
    return typeof error.code === 'string' ? error.code : undefined;
  }

  return undefined;
}

export function isRiskChallengeError(err: unknown): boolean {
  return getApiErrorCode(err) === 'RISK_CHALLENGE';
}

export class PostRegisterLoginChallengeError extends Error {
  constructor() {
    super('Login requires challenge after successful registration');
    this.name = 'PostRegisterLoginChallengeError';
  }
}

export function isPostRegisterLoginChallengeError(err: unknown): boolean {
  return err instanceof PostRegisterLoginChallengeError;
}

export function isWithdrawalVerificationRequiredError(err: unknown): boolean {
  return getApiErrorCode(err) === 'WITHDRAWAL_VERIFICATION_REQUIRED';
}

export function isWithdrawalLimitExceededError(err: unknown): boolean {
  return getApiErrorCode(err) === 'WITHDRAWAL_LIMIT_EXCEEDED';
}

export function getApiErrorDetails(err: unknown): Record<string, unknown> | undefined {
  const apiErr = err as { response?: { data?: unknown } };
  const data = apiErr.response?.data;

  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;

  if (record.error && typeof record.error === 'object') {
    const error = record.error as { details?: Record<string, unknown> };
    return error.details;
  }

  return undefined;
}

export function getAuthApiErrorMessage(
  err: unknown,
  fallback: string,
  t: (key: string) => string,
): string {
  const code = getApiErrorCode(err);

  if (code === 'RISK_BLOCKED') {
    return t('auth.riskBlocked');
  }

  if (code === 'RISK_CHALLENGE') {
    return t('auth.riskChallenge');
  }

  return getApiErrorMessage(err, fallback);
}
