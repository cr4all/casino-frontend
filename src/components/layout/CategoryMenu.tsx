import { Link, useLocation } from 'react-router-dom';
import { categoryMenuItems } from '@/data/mockData';

export function CategoryMenu() {
  const location = useLocation();

  return (
    <nav className="sticky top-16 z-30 border-b border-white/5 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {categoryMenuItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-white shadow-card'
                    : 'text-muted hover:bg-card hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
