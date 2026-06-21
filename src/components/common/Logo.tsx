import { type CSSProperties, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  LOGO_FONT_FAMILY,
  LOGO_FONT_SIZE,
  LOGO_FONT_WEIGHT,
  LOGO_LETTER_SPACING,
  LOGO_TEXT_X,
  LOGO_TEXT_Y,
  LOGO_VIEWBOX,
} from '@/components/common/brandMark';

interface LogoProps {
  className?: string;
  height?: number;
  fill?: boolean;
  onClick?: () => void;
}

function LogoMark({
  className,
  style,
  gradientId,
}: {
  className?: string;
  style?: CSSProperties;
  gradientId: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOGO_VIEWBOX}
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label="IBETS24"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="45%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#F57C00" />
        </linearGradient>
      </defs>

      <text
        x={LOGO_TEXT_X}
        y={LOGO_TEXT_Y}
        textAnchor="start"
        fontFamily={LOGO_FONT_FAMILY}
        fontSize={LOGO_FONT_SIZE}
        fontWeight={LOGO_FONT_WEIGHT}
        fontStyle="italic"
        letterSpacing={LOGO_LETTER_SPACING}
      >
        <tspan fill="#FFFFFF">IBETS</tspan>
        <tspan fill={`url(#${gradientId})`}>24</tspan>
      </text>
    </svg>
  );
}

export function Logo({ className = '', height = 32, fill = false, onClick }: LogoProps) {
  const gradientId = useId().replace(/:/g, '');
  const sizeClass = fill ? 'h-auto w-full max-h-16' : 'h-auto w-auto';

  return (
    <Link
      to="/"
      onClick={onClick}
      className={`inline-flex items-center ${fill ? 'block w-full' : ''} ${className}`}
      aria-label="IBETS24"
    >
      <LogoMark
        gradientId={gradientId}
        className={sizeClass}
        style={fill ? undefined : { height, width: 'auto', maxWidth: '100%' }}
      />
    </Link>
  );
}
