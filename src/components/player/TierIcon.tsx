const TIER_COLORS: Record<string, { fill: string; stroke: string; gem: string }> = {
  regular: { fill: '#4B5563', stroke: '#9CA3AF', gem: '#D1D5DB' },
  bronze: { fill: '#92400E', stroke: '#D97706', gem: '#F59E0B' },
  silver: { fill: '#475569', stroke: '#94A3B8', gem: '#E2E8F0' },
  gold: { fill: '#854D0E', stroke: '#CA8A04', gem: '#FACC15' },
  platinum: { fill: '#334155', stroke: '#64748B', gem: '#CBD5E1' },
  diamond: { fill: '#155E75', stroke: '#06B6D4', gem: '#67E8F9' },
  vip: { fill: '#581C87', stroke: '#A855F7', gem: '#E879F9' },
};

interface TierIconProps {
  slug: string;
  size?: number;
  className?: string;
}

export function TierIcon({ slug, size = 24, className = '' }: TierIconProps) {
  const colors = TIER_COLORS[slug] ?? TIER_COLORS.regular;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M16 2L28 8V18C28 24.627 22.627 28 16 30C9.373 28 4 24.627 4 18V8L16 2Z"
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M16 8L22 11.5V17C22 20.314 19.314 22.5 16 23.5C12.686 22.5 10 20.314 10 17V11.5L16 8Z"
        fill={colors.gem}
        fillOpacity="0.85"
      />
      <path d="M16 11L18.5 13.5L16 16L13.5 13.5L16 11Z" fill={colors.stroke} />
    </svg>
  );
}

export function vipTierIconPath(slug: string): string {
  return `/vip-levels/${slug}.svg`;
}
