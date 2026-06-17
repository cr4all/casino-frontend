import { useId } from 'react';
import type { Language } from '@/i18n';
import { CountryFlag } from '@/components/common/CountryFlag';

interface FlagIconProps {
  language: Language;
  className?: string;
}

const baseClass = 'h-4 w-5 shrink-0 rounded-[2px] ring-1 ring-white/15';

/** ISO 3166-1 alpha-2 codes for languages without an inline SVG flag. */
const FLAG_COUNTRY_CODES: Partial<Record<Language, string>> = {
  ar: 'sa',
  cs: 'cz',
  da: 'dk',
  et: 'ee',
  fi: 'fi',
  hu: 'hu',
  lv: 'lv',
  no: 'no',
  pl: 'pl',
  sk: 'sk',
};

export function FlagIcon({ language, className = baseClass }: FlagIconProps) {
  const countryCode = FLAG_COUNTRY_CODES[language];
  if (countryCode) {
    return <CountryFlag countryCode={countryCode} className={className} />;
  }

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
    case 'fr':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="1" height="2" fill="#002395" />
          <rect width="1" height="2" x="1" fill="#fff" />
          <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
      );
    case 'ru':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="3" height="2" fill="#fff" />
          <rect width="3" height="1.333" y="0.667" fill="#0039A6" />
          <rect width="3" height="0.667" y="1.333" fill="#D52B1E" />
        </svg>
      );
    case 'zh':
      return (
        <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
          <rect width="30" height="20" fill="#DE2910" />
          <polygon fill="#FFDE00" points="5,2 6.2,5.8 10,5.8 7,8.2 8.2,12 5,9.6 1.8,12 3,8.2 0,5.8 3.8,5.8" />
        </svg>
      );
    case 'ja':
      return (
        <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
          <rect width="30" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="6" fill="#BC002D" />
        </svg>
      );
    case 'pt':
      return (
        <svg className={className} viewBox="0 0 600 400" aria-hidden="true">
          <rect width="600" height="400" fill="#006600" />
          <rect width="240" height="400" fill="#FF0000" />
          <circle cx="240" cy="200" r="80" fill="#FFCC00" />
          <circle cx="260" cy="200" r="60" fill="#006600" />
        </svg>
      );
    case 'pt-br':
      return (
        <svg className={className} viewBox="0 0 720 504" aria-hidden="true">
          <rect width="720" height="504" fill="#009B3A" />
          <polygon fill="#FEDF00" points="360,42 684,252 360,462 36,252" />
          <circle cx="360" cy="252" r="95" fill="#002776" />
        </svg>
      );
    case 'mk':
      return (
        <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
          <rect width="60" height="30" fill="#D20000" />
          <circle cx="15" cy="15" r="8" fill="#FFE600" />
          <circle cx="15" cy="15" r="5" fill="#D20000" />
        </svg>
      );
    case 'el':
      return (
        <svg className={className} viewBox="0 0 27 18" aria-hidden="true">
          <rect width="27" height="18" fill="#0D5EAF" />
          <rect width="27" height="2" y="2" fill="#fff" />
          <rect width="27" height="2" y="6" fill="#fff" />
          <rect width="27" height="2" y="10" fill="#fff" />
          <rect width="27" height="2" y="14" fill="#fff" />
          <rect width="10" height="10" fill="#0D5EAF" />
          <rect width="10" height="2" y="2" fill="#fff" />
          <rect width="10" height="2" y="6" fill="#fff" />
          <rect width="2" height="10" x="2" fill="#fff" />
          <rect width="2" height="10" x="6" fill="#fff" />
        </svg>
      );
    case 'it':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="1" height="2" fill="#009246" />
          <rect width="1" height="2" x="1" fill="#fff" />
          <rect width="1" height="2" x="2" fill="#CE2B37" />
        </svg>
      );
    case 'tr':
      return (
        <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
          <rect width="30" height="20" fill="#E30A17" />
          <circle cx="11" cy="10" r="5" fill="#fff" />
          <circle cx="12.5" cy="10" r="4" fill="#E30A17" />
          <polygon fill="#fff" points="17,10 19.5,11 18.5,8.5 20.5,6.5 17.8,6.5 17,4 16.2,6.5 13.5,6.5 15.5,8.5 14.5,11" />
        </svg>
      );
    case 'ko':
      return (
        <svg className={className} viewBox="0 0 30 20" aria-hidden="true">
          <rect width="30" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="5.5" fill="#C60C30" />
          <path
            fill="#003478"
            d="M15 4.5a5.5 5.5 0 0 1 0 11 2.75 2.75 0 0 1 0-5.5 2.75 2.75 0 0 0 0-5.5z"
          />
          <g fill="#000" transform="translate(15 3.2) scale(0.22)">
            <path d="M0-6L1.8-1.8 6 0 1.8 1.8 0 6-1.8 1.8-6 0-1.8-1.8z" />
          </g>
          <g fill="#000" transform="translate(22.5 6.5) scale(0.18)">
            <path d="M0-6L1.8-1.8 6 0 1.8 1.8 0 6-1.8 1.8-6 0-1.8-1.8z" />
          </g>
          <g fill="#000" transform="translate(20 14) scale(0.18)">
            <path d="M0-6L1.8-1.8 6 0 1.8 1.8 0 6-1.8 1.8-6 0-1.8-1.8z" />
          </g>
          <g fill="#000" transform="translate(10 14) scale(0.18)">
            <path d="M0-6L1.8-1.8 6 0 1.8 1.8 0 6-1.8 1.8-6 0-1.8-1.8z" />
          </g>
        </svg>
      );
    case 'sr':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="3" height="0.667" fill="#C6363C" />
          <rect width="3" height="0.667" y="0.667" fill="#0C4076" />
          <rect width="3" height="0.667" y="1.333" fill="#fff" />
        </svg>
      );
    case 'hr':
      return (
        <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
          <rect width="60" height="10" fill="#FF0000" />
          <rect width="60" height="10" y="10" fill="#fff" />
          <rect width="60" height="10" y="20" fill="#171796" />
          <rect width="20" height="20" fill="#FF0000" />
          <rect width="10" height="10" x="5" y="5" fill="#fff" />
          <rect width="10" height="10" x="15" y="15" fill="#fff" />
        </svg>
      );
    case 'sl':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="3" height="0.667" fill="#fff" />
          <rect width="3" height="0.667" y="0.667" fill="#0000FF" />
          <rect width="3" height="0.667" y="1.333" fill="#FF0000" />
        </svg>
      );
    case 'fil':
      return (
        <svg className={className} viewBox="0 0 60 30" aria-hidden="true">
          <rect width="60" height="15" fill="#0038A8" />
          <rect width="60" height="15" y="15" fill="#CE1126" />
          <polygon fill="#fff" points="0,0 30,15 0,30" />
          <circle cx="10" cy="15" r="4" fill="#FCD116" />
        </svg>
      );
    case 'id':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="3" height="1" fill="#FF0000" />
          <rect width="3" height="1" y="1" fill="#fff" />
        </svg>
      );
    case 'hi':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="3" height="0.667" fill="#FF9933" />
          <rect width="3" height="0.667" y="0.667" fill="#fff" />
          <rect width="3" height="0.667" y="1.333" fill="#138808" />
          <circle cx="1.5" cy="1" r="0.25" fill="#000080" />
        </svg>
      );
    case 'ur':
      return (
        <svg className={className} viewBox="0 0 3 2" aria-hidden="true">
          <rect width="3" height="2" fill="#01411C" />
          <rect width="0.75" height="2" fill="#fff" />
          <circle cx="1.1" cy="1" r="0.35" fill="#01411C" />
          <circle cx="1.2" cy="1" r="0.28" fill="#fff" />
        </svg>
      );
    default:
      return null;
  }
}
