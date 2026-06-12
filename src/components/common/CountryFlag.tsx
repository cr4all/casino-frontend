import { useState } from 'react';

interface CountryFlagProps {
  countryCode: string;
  className?: string;
}

const DEFAULT_CLASS = 'h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/15';

export function CountryFlag({
  countryCode,
  className = DEFAULT_CLASS,
}: CountryFlagProps) {
  const [failed, setFailed] = useState(false);
  const code = countryCode.toLowerCase();

  if (!code || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-white/10 text-[10px] text-muted ${className}`}
        aria-hidden="true"
      >
        ?
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt=""
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
