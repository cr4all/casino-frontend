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

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const apiErr = err as { response?: { data?: unknown } };
  const messages = collectValidationMessages(apiErr.response?.data);

  if (messages.length > 0) {
    return [...new Set(messages)].join('\n');
  }

  return fallback;
}
