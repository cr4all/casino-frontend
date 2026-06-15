import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameCard } from '@/components/game/GameCard';
import { HeroBanner } from '@/components/home/HeroBanner';
import { HomeCategoryBar, getTypeSlug, isTypeCategory, type HomeCategory } from '@/components/home/HomeCategoryBar';
import { ProviderSelect } from '@/components/provider/ProviderSelect';
import { gameApi } from '@/api/game.api';
import { useGameVendors } from '@/hooks/useGameVendors';
import { useTranslation } from '@/hooks/useTranslation';
import type { Game } from '@/types';

const PER_PAGE = 24;

export function HomePage() {
  const { t } = useTranslation();
  const { vendors, loading: vendorsLoading } = useGameVendors();
  const [activeCategory, setActiveCategory] = useState<HomeCategory>('all');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const handleCategoryChange = useCallback((category: HomeCategory) => {
    setActiveCategory(category);
    setSearchQuery('');
    setPage(1);
  }, []);

  const handleVendorChange = useCallback((vendorId: number | null) => {
    setSelectedVendorId(vendorId);
    setSearchQuery('');
    setPage(1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadGames = async () => {
      try {
        if (activeCategory === 'all' || isTypeCategory(activeCategory)) {
          const typeSlug = getTypeSlug(activeCategory);
          const data = await gameApi.getGames({
            vendor: selectedVendorId ?? undefined,
            type: typeSlug ?? undefined,
            page,
            per_page: PER_PAGE,
          });
          if (cancelled) return;
          setGames(data.items);
          setLastPage(data.pagination.last_page);
          return;
        }

        const data = await gameApi.getCollection(activeCategory);
        if (cancelled) return;
        let items = data.games ?? [];
        if (selectedVendorId !== null) {
          items = items.filter((game) => game.vendor?.id === selectedVendorId);
        }
        setGames(items);
        setLastPage(1);
      } catch {
        if (cancelled) return;
        setGames([]);
        setLastPage(1);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadGames();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, selectedVendorId, page]);

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return games;
    return games.filter((game) => game.name.toLowerCase().includes(query));
  }, [games, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-5">
      <HeroBanner />

      <HomeCategoryBar active={activeCategory} onChange={handleCategoryChange} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('category.searchPlaceholder')}
            className="w-full rounded-xl border border-white/10 bg-card py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted focus:border-accent-gold focus:outline-none"
          />
        </div>

        <ProviderSelect
          vendors={vendors}
          selectedVendorId={selectedVendorId}
          onChange={handleVendorChange}
          loading={vendorsLoading}
        />
      </div>

      {loading ? (
        <p className="text-muted px-2">{t('common.loadingGames')}</p>
      ) : filteredGames.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-card p-8 text-center">
          <p className="text-muted">{t('category.noGamesFound')}</p>
          {isSearching && (
            <p className="mt-2 text-xs text-muted">&quot;{searchQuery.trim()}&quot;</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                variant="grid"
                isNew={activeCategory === 'new'}
              />
            ))}
          </div>

          {(activeCategory === 'all' || isTypeCategory(activeCategory)) &&
            lastPage > 1 &&
            !isSearching && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-white/10 bg-card px-4 py-2 text-sm text-white disabled:opacity-40 hover:border-accent-gold/30"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-muted">
                {t('common.pageOf', { page, last: lastPage })}
              </span>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-white/10 bg-card px-4 py-2 text-sm text-white disabled:opacity-40 hover:border-accent-gold/30"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
