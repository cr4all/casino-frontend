import { useGameTypes } from '@/hooks/useGameTypes';
import { useTranslation } from '@/hooks/useTranslation';
import { GameTypeIcon } from '@/components/common/GameTypeIcon';
import { NavIcon } from '@/components/common/NavIcon';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export type HomeCategory = 'all' | 'top' | 'popular' | 'new' | 'favorites' | `type-${string}`;

const COLLECTION_CATEGORIES: { id: HomeCategory; icon?: string }[] = [
  { id: 'all', icon: '▦' },
  { id: 'favorites' },
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);

  const labelFor = (id: HomeCategory) => {
    if (id === 'all') return t('category.allGames');
    if (isTypeCategory(id)) {
      const slug = getTypeSlug(id)!;
      const type = types.find((item) => item.slug === slug);
      return type ? tGameType(type.slug, type.name) : slug;
    }
    return tCollection(id);
  };

  const typeCategories: { id: HomeCategory; slug: string; icon: string | null }[] = types.map((type) => ({
    id: `type-${type.slug}` as HomeCategory,
    slug: type.slug,
    icon: type.icon,
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
      {categories.map((category) => {
        const { id } = category;
        const isActive = active === id;
        const isType = 'slug' in category;
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (id === 'favorites' && !isAuthenticated) {
                openModal('login');
                return;
              }
              onChange(id);
            }}
            className={`flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all sm:w-[100px] ${
              isActive
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold shadow-gold'
                : 'border-white/10 bg-card text-muted hover:border-white/20 hover:text-white'
            }`}
          >
            {isType ? (
              <GameTypeIcon
                slug={(category as { slug: string; icon: string | null }).slug}
                icon={(category as { slug: string; icon: string | null }).icon}
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            ) : id === 'favorites' ? (
              <NavIcon
                name="favorites"
                className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
                fill="var(--color-accent-gold)"
              />
            ) : (
              <span className="text-xl leading-none sm:text-2xl">{(category as { icon?: string }).icon}</span>
            )}
            <span className="w-full truncate text-center text-[10px] font-semibold leading-tight sm:text-[11px]">
              {labelFor(id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
