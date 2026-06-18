import { type CSSProperties, useId } from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  height?: number;
  /** Fill the container width (best for wide sidebar logos). */
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
      viewBox="0 0 240 52"
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

      <rect x="6" y="5" width="7.5" height="7.5" rx="1.5" fill="#FFB300" />

      <text
        x="4"
        y="40"
        fontFamily="Montserrat, 'Arial Black', Arial, sans-serif"
        fontSize="36"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="0.02em"
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
        style={fill ? undefined : { height, width: 'auto' }}
      />
    </Link>
  );
}
