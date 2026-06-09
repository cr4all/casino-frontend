import { useId } from 'react';
import type { Language } from '@/i18n';

interface FlagIconProps {
  language: Language;
  className?: string;
}

const baseClass = 'h-4 w-5 shrink-0 rounded-[2px] ring-1 ring-white/15';

export function FlagIcon({ language, className = baseClass }: FlagIconProps) {
  const ukClipId = useId();

  switch (language) {
    case 'en':
      return (
        <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
          <clipPath id={ukClipId}>
            <path d="M0 0v30h60V0z" />
          </clipPath>
          <g clipPath={`url(#${ukClipId})`}>
            <path fill="#012169" d="M0 0v30h60V0z" />
            <path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
            <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
            <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
            <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
          </g>
        </svg>
      );
    case 'de':
      return (
        <svg className={className} viewBox="0 0 5 3" aria-hidden="true">
          <rect width="5" height="3" fill="#000" />
          <rect width="5" height="2" y="1" fill="#DD0000" />
          <rect width="5" height="1" y="2" fill="#FFCE00" />
        </svg>
      );
    case 'es':
      return (
        <svg className={className} viewBox="0 0 750 500" aria-hidden="true">
          <rect width="750" height="500" fill="#AA151B" />
          <rect width="750" height="250" y="125" fill="#F1BF00" />
        </svg>
      );
    case 'sq':
      return (
        <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
          <rect width="640" height="480" fill="#EE1C25" />
          <path
            fill="#000"
            d="M320 95c-55 0-100 35-115 85 25-15 55-22 85-22h5c-25 15-40 42-40 72 0 48 39 87 87 87 14 0 27-3 39-9-8 22-28 38-52 42 26 8 54 2 74-16 20 18 48 24 74 16-24-4-44-20-52-42 12 6 25 9 39 9 48 0 87-39 87-87 0-30-15-57-40-72h5c30 0 60 7 85 22-15-50-60-85-115-85z"
          />
        </svg>
      );
    default:
      return null;
  }
}
