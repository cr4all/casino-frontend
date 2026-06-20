import { typeIconSrc } from '@/stores/gameStore';

interface GameTypeIconProps {
  slug: string;
  icon?: string | null;
  className?: string;
}

export function GameTypeIcon({ slug, icon, className = 'h-6 w-6 object-contain' }: GameTypeIconProps) {
  return (
    <img
      src={typeIconSrc(icon, slug)}
      alt=""
      className={className}
      loading="lazy"
      aria-hidden="true"
    />
  );
}
