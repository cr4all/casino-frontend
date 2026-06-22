import { describe, expect, it } from 'vitest';
import { getApiErrorCode, getAuthApiErrorMessage, isRiskChallengeError } from './apiError';

const t = (key: string): string => {
  const messages: Record<string, string> = {
    'auth.riskBlocked': 'This action was blocked for security reasons.',
    'auth.riskChallenge': 'Additional verification is required before you can continue.',
  };

  return messages[key] ?? key;
};

describe('getApiErrorCode', () => {
  it('extracts error code from API response', () => {
    const err = {
      response: {
        data: {
          success: false,
          error: { code: 'RISK_BLOCKED', message: 'Request blocked by risk evaluation.' },
        },
      },
    };

    expect(getApiErrorCode(err)).toBe('RISK_BLOCKED');
  });

  it('returns undefined when response has no error code', () => {
    expect(getApiErrorCode({})).toBeUndefined();
  });
});

describe('getAuthApiErrorMessage', () => {
  it('returns localized message for RISK_BLOCKED', () => {
    const err = {
      response: {
        data: {
          error: { code: 'RISK_BLOCKED', message: 'Request blocked by risk evaluation.' },
        },
      },
    };

    expect(getAuthApiErrorMessage(err, 'Invalid credentials.', t)).toBe(
      'This action was blocked for security reasons.',
    );
  });

  it('returns localized message for RISK_CHALLENGE', () => {
    const err = {
      response: {
        data: {
          error: { code: 'RISK_CHALLENGE', message: 'Additional verification is required.' },
        },
      },
    };

    expect(getAuthApiErrorMessage(err, 'Registration failed.', t)).toBe(
      'Additional verification is required before you can continue.',
    );
  });

  it('falls back to validation messages for other errors', () => {
    const err = {
      response: {
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'The given data was invalid.',
            details: { email: ['Invalid email.'] },
          },
        },
      },
    };

    expect(getAuthApiErrorMessage(err, 'Registration failed.', t)).toBe('Invalid email.');
  });

  it('uses fallback when no API message is available', () => {
    expect(getAuthApiErrorMessage({}, 'Invalid username or password.', t)).toBe(
      'Invalid username or password.',
    );
  });
});

describe('isRiskChallengeError', () => {
  it('returns true for RISK_CHALLENGE', () => {
    const err = {
      response: {
        data: {
          error: { code: 'RISK_CHALLENGE', message: 'Additional verification is required.' },
        },
      },
    };

    expect(isRiskChallengeError(err)).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isRiskChallengeError({})).toBe(false);
  });
});
