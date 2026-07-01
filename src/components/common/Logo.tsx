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
  logoWidthForHeight,
} from '@/components/common/brandMark';

interface LogoProps {
  className?: string;
  height?: number;
  fill?: boolean;
  onClick?: () => void;
}

export function LogoMark({
  className,
  style,
  gradientId,
  width,
  height,
}: {
  className?: string;
  style?: CSSProperties;
  gradientId: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOGO_VIEWBOX}
      fill="none"
      {...(width != null ? { width } : {})}
      {...(height != null ? { height } : {})}
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
  const width = logoWidthForHeight(height);
  const sizeClass = fill ? 'h-auto w-full max-h-16' : 'block max-w-full';

  return (
    <Link
      to="/"
      onClick={onClick}
      dir="ltr"
      className={`inline-flex shrink-0 items-center ${fill ? 'block w-full' : ''} ${className}`}
      aria-label="IBETS24"
    >
      <LogoMark
        gradientId={gradientId}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={sizeClass}
        style={fill ? undefined : { height, width, maxWidth: '100%' }}
      />
    </Link>
  );
}
