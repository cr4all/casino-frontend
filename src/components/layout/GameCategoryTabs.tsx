import { Link, useLocation } from 'react-router-dom';
import { useGameTypes } from '@/hooks/useGameTypes';
import { typePath, typeIcon } from '@/stores/gameStore';

export function GameCategoryTabs() {
  const location = useLocation();
  const { types, loading } = useGameTypes();

  const tabs = [
    { id: 'all', label: 'ALL GAMES', icon: '⭐', path: '/category/all' },
    ...types.map((t) => ({
      id: `type-${t.slug}`,
      label: t.name.toUpperCase(),
      icon: typeIcon(t.icon, t.slug),
      path: typePath(t.slug),
    })),
  ];

  const isActive = (path: string) => {
    if (path === '/category/all') {
      return location.pathname === '/' || location.pathname === '/category/all';
    }
    return location.pathname === path;
  };

  if (loading && tabs.length <= 1) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-card/50 p-3">
        <p className="text-xs text-muted px-2">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.08] bg-card/50 p-1">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-xs font-bold tracking-wide transition-all ${
                active
                  ? 'border border-accent-gold/40 bg-accent-gold/10 text-accent-gold shadow-gold'
                  : 'border border-transparent text-muted hover:text-white hover:bg-surface'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
