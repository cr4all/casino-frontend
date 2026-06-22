import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { getTurnstileSiteKey } from '@/lib/turnstileConfig';

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onRegisterReset?: (reset: () => void) => void;
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onSuccess, onError, onExpire, onRegisterReset }, ref) {
    const turnstileRef = useRef<TurnstileInstance | null>(null);
    const siteKey = getTurnstileSiteKey();

    const reset = () => {
      turnstileRef.current?.reset();
    };

    useImperativeHandle(ref, () => ({ reset }));

    useEffect(() => {
      onRegisterReset?.(reset);
    }, [onRegisterReset]);

    if (!siteKey) {
      return null;
    }

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        options={{ theme: 'dark', size: 'flexible' }}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
      />
    );
  },
);
