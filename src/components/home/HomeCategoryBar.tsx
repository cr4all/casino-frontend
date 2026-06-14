import { useGameTypes } from '@/hooks/useGameTypes';
import { useTranslation } from '@/hooks/useTranslation';
import { typeIcon } from '@/stores/gameStore';

export type HomeCategory = 'all' | 'top' | 'popular' | 'new' | `type-${string}`;

const COLLECTION_CATEGORIES: { id: HomeCategory; icon: string }[] = [
  { id: 'all', icon: '▦' },
  { id: 'top', icon: '👑' },
  { id: 'popular', icon: '✨' },
  { id: 'new', icon: '🚀' },
];

export function isTypeCategory(category: HomeCategory): category is `type-${string}` {
  return category.startsWith('type-');
}

export function getTypeSlug(category: HomeCategory): string | null {
  return isTypeCategory(category) ? category.slice(5) : null;
}

interface HomeCategoryBarProps {
  active: HomeCategory;
  onChange: (category: HomeCategory) => void;
}

export function HomeCategoryBar({ active, onChange }: HomeCategoryBarProps) {
  const { t, tCollection, tGameType } = useTranslation();
  const { types, loading } = useGameTypes();

  const labelFor = (id: HomeCategory) => {
    if (id === 'all') return t('category.allGames');
    if (isTypeCategory(id)) {
      const slug = getTypeSlug(id)!;
      const type = types.find((item) => item.slug === slug);
      return type ? tGameType(type.slug, type.name) : slug;
    }
    return tCollection(id);
  };

  const typeCategories: { id: HomeCategory; icon: string }[] = types.map((type) => ({
    id: `type-${type.slug}` as HomeCategory,
    icon: typeIcon(type.icon, type.slug),
  }));

  const categories = [...COLLECTION_CATEGORIES, ...typeCategories];

  if (loading && types.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-card/50 px-4 py-3">
        <p className="text-xs text-muted">{t('common.loadingCategories')}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(({ id, icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all sm:w-[100px] ${
              isActive
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold shadow-gold'
                : 'border-white/10 bg-card text-muted hover:border-white/20 hover:text-white'
            }`}
          >
            <span className="text-xl leading-none sm:text-2xl">{icon}</span>
            <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-xs">
              {labelFor(id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
