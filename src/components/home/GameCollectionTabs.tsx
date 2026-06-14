import { useTranslation } from '@/hooks/useTranslation';

export type CollectionSlug = 'top' | 'popular' | 'new';

const COLLECTION_TABS: { slug: CollectionSlug; icon: string }[] = [
  { slug: 'top', icon: '👑' },
  { slug: 'popular', icon: '✨' },
  { slug: 'new', icon: '🚀' },
];

interface GameCollectionTabsProps {
  active: CollectionSlug | null;
  onChange: (slug: CollectionSlug) => void;
}

export function GameCollectionTabs({ active, onChange }: GameCollectionTabsProps) {
  const { tCollection } = useTranslation();

  return (
    <div className="rounded-lg border border-white/[0.08] bg-card/30 p-1">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {COLLECTION_TABS.map(({ slug, icon }) => {
          const isActive = active === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => onChange(slug)}
              className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-xs font-bold tracking-wide transition-all ${
                isActive
                  ? 'border border-accent-gold/40 bg-accent-gold/10 text-accent-gold shadow-gold'
                  : 'border border-transparent text-muted hover:bg-surface hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {tCollection(slug)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
