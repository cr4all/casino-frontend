import { describe, expect, it } from 'vitest';
import { isTheme } from '@/stores/themeStore';

describe('isTheme', () => {
  it('accepts dark and light', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('light')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isTheme('outdoor')).toBe(false);
    expect(isTheme('')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
