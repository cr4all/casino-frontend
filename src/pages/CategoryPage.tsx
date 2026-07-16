import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { GameCard } from '@/components/game/GameCard';
import { GameCategoryTabs } from '@/components/layout/GameCategoryTabs';
import { SectionTitle } from '@/components/common/SectionTitle';
import { PromoBannerGrid } from '@/components/home/PromoBanner';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { ProviderSelect } from '@/components/provider/ProviderSelect';
import { ShowMoreButton } from '@/components/common/ShowMoreButton';
import { LiveBetFeed } from '@/components/bets/LiveBetFeed';
import { gameApi } from '@/api/game.api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useProvidersForCategory } from '@/hooks/useProvidersForCategory';
import { useGameVendors } from '@/hooks/useGameVendors';
import { useTranslation } from '@/hooks/useTranslation';
import { getVendorBannerUrl } from '@/data/providerBanners';
import { mockPromotions } from '@/data/mockData';
import { vendorGradient, vendorPath } from '@/stores/gameStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import type { Game } from '@/types';

function parseCategoryFilters(category: string) {
  const vendorMatch = category.match(/^vendor-(\d+)$/);
  const typeMatch = category.match(/^type-([a-z_]+)$/);
  const collectionMatch = category.match(/^collection-([a-z]+)$/);

  return {
    vendorId: vendorMatch ? Number(vendorMatch[1]) : undefined,
    typeSlug: typeMatch ? typeMatch[1] : undefined,
    collectionSlug: collectionMatch ? collectionMatch[1] : undefined,
    isFavorites: category === 'favorites',
  };
}

export function CategoryPage() {
  const { t, tGameType, tCollection } = useTranslation();
  const { category = 'all' } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vendors, loading: vendorsLoading } = useGameVendors();
  const { types } = useGameTypes();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 400, [category, selectedVendorId]);

  const { vendorId, typeSlug, collectionSlug, isFavorites } = parseCategoryFilters(category);
  const effectiveVendorId = selectedVendorId ?? vendorId;
  const { vendors: filteredVendors, loading: filteredVendorsLoading } = useProvidersForCategory(
    typeSlug ?? null,
  );
  const providerVendors = typeSlug ? filteredVendors : vendors;
  const providerVendorsLoading = typeSlug ? filteredVendorsLoading : vendorsLoading;

  const title = useMemo(() => {
    if (isFavorites) {
      return tCollection('favorites');
    }
    if (vendorId) {
      const vendor = vendors.find((v) => v.id === vendorId);
      return vendor?.name ?? t('category.games');
    }
    if (typeSlug) {
      const type = types.find((tp) => tp.slug === typeSlug);
      return type ? tGameType(type.slug, type.name) : t('category.games');
    }
    if (collectionSlug) {
      return tCollection(collectionSlug);
    }
    return t('category.allGames');
  }, [isFavorites, vendorId, typeSlug, collectionSlug, vendors, types, t, tGameType, tCollection]);

  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
    setSearch(searchParams.get('q') ?? '');
    setSelectedVendorId(null);
  }, [category]);

  useEffect(() => {
    if (
      selectedVendorId !== null &&
      !providerVendors.some((vendor) => vendor.id === selectedVendorId)
    ) {
      setSelectedVendorId(null);
    }
  }, [providerVendors, selectedVendorId]);

  const handleVendorChange = useCallback((vendorId: number | null) => {
    setSelectedVendorId(vendorId);
    setSearch('');
    setPage(1);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    setPage(1);
    setLoadingMore(false);
  }, [debouncedSearch]);

  useEffect(() => {
    const query = debouncedSearch;
    const current = searchParams.get('q') ?? '';
    if (query === current) return;

    if (query) {
      setSearchParams({ q: query }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  useEffect(() => {
    if (category === 'promos' || category === 'providers') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const isFirstPage = page === 1;

    if (isFirstPage) {
      setLoading(true);
      setLoadingMore(false);
    } else {
      setLoadingMore(true);
    }

    const request = isFavorites
      ? gameApi.getFavorites(page, 24)
      : gameApi.getGames({
          vendor: effectiveVendorId,
          type: typeSlug,
          collection: collectionSlug,
          search: debouncedSearch || undefined,
          page,
          per_page: 24,
        });

    request
      .then((data) => {
        if (cancelled) return;
        setLastPage(data.pagination.last_page);
        if (isFirstPage) {
          setGames(data.items);
        } else {
          setGames((prev) => [...prev, ...data.items]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (isFirstPage) {
          setGames([]);
          setLastPage(1);
        }
      })
      .finally(() => {
        if (!cancelled) {
          if (isFirstPage) {
            setLoading(false);
          }
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category, isFavorites, effectiveVendorId, typeSlug, collectionSlug, page, debouncedSearch]);

  const handleShowMore = () => {
    if (loadingMore || page >= lastPage) return;
    setPage((p) => p + 1);
  };

  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const displayGames = isFavorites ? games.filter((game) => favoriteIds.has(game.id)) : games;

  if (category === 'providers') {
    return (
      <div className="space-y-5">
        <GameCategoryTabs />
        <SectionTitle title={t('home.browseByProvider')} showArrows={false} />
        {vendorsLoading ? (
          <p className="text-muted">{t('common.loadingGames')}</p>
        ) : vendors.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-card p-8 text-center">
            <p className="text-muted">{t('category.noProvidersFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {vendors.map((vendor, index) => (
              <ProviderCard
                key={vendor.id}
                name={vendor.name}
                gameCount={vendor.game_count}
                imageUrl={getVendorBannerUrl(vendor)}
                gradient={vendorGradient(index)}
                path={vendorPath(vendor.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (category === 'promos') {
    return (
      <div className="space-y-5">
        <GameCategoryTabs />
        <SectionTitle title={t('category.promotions')} showAllPath="/bonus" showArrows={false} />
        <Link to="/bonus" className="inline-flex rounded-lg bg-accent-gold px-6 py-2.5 text-sm font-bold text-background">
          {t('category.viewBonuses')}
        </Link>
        <PromoBannerGrid promotions={mockPromotions} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <GameCategoryTabs />

      <SectionTitle title={title} showArrows={false} />

      {!isFavorites && (
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('category.searchPlaceholder')}
            className="w-full rounded-xl border border-white/10 bg-card py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted focus:border-accent-gold focus:outline-none"
          />
        </div>

        <ProviderSelect
          vendors={providerVendors}
          selectedVendorId={effectiveVendorId ?? null}
          onChange={handleVendorChange}
          loading={providerVendorsLoading}
        />
      </div>
      )}

      {loading ? (
        <p className="text-muted">{t('common.loadingGames')}</p>
      ) : displayGames.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-card p-8 text-center">
          <p className="text-muted">
            {isFavorites ? t('category.noFavoritesYet') : t('category.noGamesFound')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {displayGames.map((game) => (
              <GameCard key={game.id} game={game} variant="grid" />
            ))}
          </div>

          <ShowMoreButton
            visible={page < lastPage}
            loading={loadingMore}
            onClick={handleShowMore}
          />

          <LiveBetFeed games={displayGames} />
        </>
      )}
    </div>
  );
}
