import { useState } from 'react';
import { getCryptoIconUrl, resolveCryptoIconId } from '@/utils/cryptoIcon';

interface CryptoIconProps {
  code: string;
  className?: string;
}

export function CryptoIcon({ code, className = 'h-8 w-8' }: CryptoIconProps) {
  const [failed, setFailed] = useState(false);
  const iconId = resolveCryptoIconId(code);

  if (failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-white/10 text-[10px] font-bold uppercase text-white ${className}`}
        aria-hidden="true"
      >
        {iconId.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={getCryptoIconUrl(code)}
      alt=""
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
