import { useCallback, useRef, useState } from 'react';

export function useRiskChallenge() {
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const widgetResetRef = useRef<(() => void) | null>(null);

  const resetChallenge = useCallback(() => {
    setChallengeRequired(false);
    setTurnstileToken(null);
  }, []);

  const registerWidgetReset = useCallback((reset: () => void) => {
    widgetResetRef.current = reset;
  }, []);

  const resetWidget = useCallback(() => {
    widgetResetRef.current?.();
    setTurnstileToken(null);
  }, []);

  return {
    challengeRequired,
    setChallengeRequired,
    turnstileToken,
    setTurnstileToken,
    resetChallenge,
    registerWidgetReset,
    resetWidget,
  };
}
