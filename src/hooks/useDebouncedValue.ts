import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value`. When any `flushDeps` entry changes,
 * the debounced value updates immediately (e.g. category navigation).
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs = 400,
  flushDeps: unknown[] = [],
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    setDebouncedValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flushDeps are intentional instant-sync triggers
  }, flushDeps);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
