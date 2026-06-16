import { useCallback, useEffect, useState } from 'react';
import { GameCard } from '@/components/game/GameCard';
import { HeroBanner } from '@/components/home/HeroBanner';
import { HomeCategoryBar, getTypeSlug, isTypeCategory, type HomeCategory } from '@/components/home/HomeCategoryBar';
import { ProviderSelect } from '@/components/provider/ProviderSelect';
import { ShowMoreButton } from '@/components/common/ShowMoreButton';
import { gameApi } from '@/api/game.api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 400, [
    activeCategory,
    selectedVendorId,
  ]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    const isFirstPage = page === 1;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const loadGames = async () => {
      try {
        const typeSlug = isTypeCategory(activeCategory) ? getTypeSlug(activeCategory) : undefined;
        const collectionSlug =
          activeCategory !== 'all' && !isTypeCategory(activeCategory) ? activeCategory : undefined;

        const data = await gameApi.getGames({
          vendor: selectedVendorId ?? undefined,
          type: typeSlug ?? undefined,
          collection: collectionSlug,
          search: debouncedSearch || undefined,
          page,
          per_page: PER_PAGE,
        });

        if (cancelled) return;

        setLastPage(data.pagination.last_page);
        if (isFirstPage) {
          setGames(data.items);
        } else {
          setGames((prev) => [...prev, ...data.items]);
        }
      } catch {
        if (cancelled) return;
        if (isFirstPage) {
          setGames([]);
          setLastPage(1);
        }
      } finally {
        if (!cancelled) {
          if (isFirstPage) {
            setLoading(false);
          } else {
            setLoadingMore(false);
          }
        }
      }
    };

    void loadGames();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, selectedVendorId, page, debouncedSearch]);

  const handleShowMore = () => {
    if (loadingMore || page >= lastPage) return;
    setPage((p) => p + 1);
  };

  const isSearching = debouncedSearch.length > 0;

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
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-card p-8 text-center">
          <p className="text-muted">{t('category.noGamesFound')}</p>
          {isSearching && (
            <p className="mt-2 text-xs text-muted">&quot;{debouncedSearch}&quot;</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                variant="grid"
                isNew={activeCategory === 'new'}
              />
            ))}
          </div>

          <ShowMoreButton
            visible={page < lastPage}
            loading={loadingMore}
            onClick={handleShowMore}
          />
        </>
      )}
    </div>
  );
}
