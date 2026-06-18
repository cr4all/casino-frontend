import { useEffect, useState } from 'react';
import { gameApi, type GameVendor } from '@/api/game.api';
import { useGameVendors } from '@/hooks/useGameVendors';

/**
 * Returns vendors for the provider dropdown.
 * When typeSlug is set (e.g. slot, live_casino), only vendors with games in that type are shown.
 * When typeSlug is null (All Games, collections), all vendors are shown.
 */
export function useProvidersForCategory(typeSlug: string | null) {
  const { vendors: allVendors, loading: allLoading } = useGameVendors();
  const [typedVendors, setTypedVendors] = useState<GameVendor[]>([]);
  const [typedLoading, setTypedLoading] = useState(false);

  useEffect(() => {
    if (!typeSlug) {
      setTypedVendors([]);
      setTypedLoading(false);
      return;
    }

    let cancelled = false;
    setTypedLoading(true);

    gameApi
      .getVendors(typeSlug)
      .then((vendors) => {
        if (!cancelled) {
          setTypedVendors(vendors);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTypedVendors([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTypedLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [typeSlug]);

  const vendors = typeSlug ? typedVendors : allVendors;
  const loading = typeSlug ? typedLoading || allLoading : allLoading;

  return { vendors, loading };
}
