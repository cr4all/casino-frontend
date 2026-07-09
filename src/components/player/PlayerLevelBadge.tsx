import { TierIcon } from '@/components/player/TierIcon';
import { useTranslation } from '@/hooks/useTranslation';

interface PlayerLevelBadgeProps {
  slug: string;
  name: string;
  size?: number;
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PlayerLevelBadge({
  slug,
  name,
  size = 24,
  showTooltip = true,
  onClick,
  className = '',
}: PlayerLevelBadgeProps) {
  const { t } = useTranslation();
  const label = showTooltip ? t('vip.currentLevel', { level: name }) : undefined;

  const content = (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${onClick ? 'cursor-pointer transition-opacity hover:opacity-80' : ''} ${className}`}
      title={label}
      aria-label={label}
    >
      <TierIcon slug={slug} size={size} />
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="inline-flex shrink-0 border-0 bg-transparent p-0">
        {content}
      </button>
    );
  }

  return content;
}
