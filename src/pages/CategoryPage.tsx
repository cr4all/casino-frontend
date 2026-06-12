import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { GameCard } from '@/components/game/GameCard';
import { GameCategoryTabs } from '@/components/layout/GameCategoryTabs';
import { SectionTitle } from '@/components/common/SectionTitle';
import { PromoBannerGrid } from '@/components/home/PromoBanner';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { gameApi } from '@/api/game.api';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useGameVendors } from '@/hooks/useGameVendors';
import { useTranslation } from '@/hooks/useTranslation';
import { getVendorBannerUrl } from '@/data/providerBanners';
import { mockPromotions } from '@/data/mockData';
import { vendorGradient, vendorPath } from '@/stores/gameStore';
import type { Game } from '@/types';

export function CategoryPage() {
  const { t, tGameType, tCollection, language } = useTranslation();
  const { category = 'all' } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vendors, loading: vendorsLoading } = useGameVendors();
  const { types } = useGameTypes();
  const [games, setGames] = useState<Game[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    if (category === 'promos' || category === 'providers') {
      setLoading(false);
      return;
    }

    setLoading(true);

    const vendorMatch = category.match(/^vendor-(\d+)$/);
    const typeMatch = category.match(/^type-([a-z_]+)$/);
    const collectionMatch = category.match(/^collection-([a-z]+)$/);

    const vendorId = vendorMatch ? Number(vendorMatch[1]) : undefined;
    const typeSlug = typeMatch ? typeMatch[1] : undefined;
    const collectionSlug = collectionMatch ? collectionMatch[1] : undefined;

    gameApi
      .getGames({
        vendor: vendorId,
        type: typeSlug,
        collection: collectionSlug,
        search: search || undefined,
        page,
        per_page: 24,
      })
      .then((data) => {
        setGames(data.items);
        setLastPage(data.pagination.last_page);

        if (vendorId) {
          const vendor = vendors.find((v) => v.id === vendorId);
          setTitle(vendor?.name ?? t('category.games'));
        } else if (typeSlug) {
          const type = types.find((tp) => tp.slug === typeSlug);
          setTitle(type ? tGameType(type.slug, type.name) : t('category.games'));
        } else if (collectionSlug) {
          setTitle(tCollection(collectionSlug));
        } else {
          setTitle(t('category.allGames'));
        }
      })
      .finally(() => setLoading(false));
  }, [category, page, search, vendors, types, t, tGameType, tCollection, language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (search) {
      setSearchParams({ q: search });
    } else {
      setSearchParams({});
    }
  };

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle title={title} showArrows={false} />
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('category.searchPlaceholder')}
            className="w-full sm:w-56 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent-gold focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-accent-gold px-4 py-2 text-sm font-bold text-background hover:bg-accent-gold/90"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-muted">{t('common.loadingGames')}</p>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-card p-8 text-center">
          <p className="text-muted">{t('category.noGamesFound')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} variant="grid" />
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
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
