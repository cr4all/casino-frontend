import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameCard } from '@/components/game/GameCard';
import { HeroBanner } from '@/components/home/HeroBanner';
import { GameCategoryTabs } from '@/components/layout/GameCategoryTabs';
import { HorizontalSlider } from '@/components/common/HorizontalSlider';
import { ProviderCard, ProviderStrip } from '@/components/provider/ProviderCard';
import { gameApi } from '@/api/game.api';
import { useGameVendors } from '@/hooks/useGameVendors';
import { collectionPath, vendorGradient, vendorPath } from '@/stores/gameStore';
import type { Game } from '@/types';

const COLLECTIONS = [
  { slug: 'top', title: 'Top Games' },
  { slug: 'popular', title: 'Popular Games' },
  { slug: 'new', title: 'New Games' },
] as const;

export function HomePage() {
  const { vendors, loading: vendorsLoading } = useGameVendors();
  const [collectionGames, setCollectionGames] = useState<Record<string, Game[]>>({});
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    setLoadingGames(true);
    Promise.all(COLLECTIONS.map((c) => gameApi.getCollection(c.slug)))
      .then((results) => {
        const bySlug: Record<string, Game[]> = {};
        COLLECTIONS.forEach((c, i) => {
          bySlug[c.slug] = results[i]?.games ?? [];
        });
        setCollectionGames(bySlug);
      })
      .finally(() => setLoadingGames(false));
  }, []);

  const loading = vendorsLoading || loadingGames;
  const hasContent = COLLECTIONS.some((c) => (collectionGames[c.slug]?.length ?? 0) > 0) || vendors.length > 0;

  return (
    <div className="space-y-5">
      <HeroBanner />
      <GameCategoryTabs />

      {loading ? (
        <p className="text-muted px-2">Loading games...</p>
      ) : !hasContent ? (
        <div className="rounded-xl border border-white/[0.08] bg-card p-8 text-center">
          <p className="text-muted">No games available yet.</p>
          <p className="mt-2 text-xs text-muted">Run game catalog sync from admin.</p>
        </div>
      ) : (
        <>
          {COLLECTIONS.map(({ slug, title }) => {
            const games = collectionGames[slug] ?? [];
            if (games.length === 0) return null;
            return (
              <section key={slug}>
                <HorizontalSlider title={title} showAllPath={collectionPath(slug)}>
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} isNew={slug === 'new'} />
                  ))}
                </HorizontalSlider>
              </section>
            );
          })}

          {vendors.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between px-0.5">
                <h2 className="text-sm font-bold tracking-wide text-white">Browse by Provider</h2>
                <Link to="/category/all" className="text-xs text-accent-gold hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {vendors.slice(0, 6).map((vendor, index) => (
                  <ProviderCard
                    key={vendor.id}
                    id={vendor.id}
                    name={vendor.name}
                    gameCount={vendor.game_count}
                    gradient={vendorGradient(index)}
                    path={vendorPath(vendor.id)}
                  />
                ))}
              </div>
              {vendors.length > 6 && (
                <ProviderStrip
                  vendors={vendors.slice(6, 14).map((v) => ({ id: v.id, name: v.name, path: vendorPath(v.id) }))}
                />
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
