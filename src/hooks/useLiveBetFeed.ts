import { useEffect, useRef, useState } from 'react';
import type { Game } from '@/types';
import {
  createLiveBetEntry,
  seedLiveBetEntries,
  type LiveBetEntry,
} from '@/utils/liveBetFeed';

const MAX_ROWS = 7;
const TICK_MS = 2600;

export function useLiveBetFeed(games: Game[]) {
  const [entries, setEntries] = useState<LiveBetEntry[]>([]);
  const gamesRef = useRef(games);

  gamesRef.current = games;

  useEffect(() => {
    if (games.length === 0) {
      setEntries([]);
      return;
    }

    setEntries(seedLiveBetEntries(games, MAX_ROWS));

    const interval = window.setInterval(() => {
      const pool = gamesRef.current;
      const entry = createLiveBetEntry(pool);
      if (!entry) return;

      setEntries((prev) => [entry, ...prev].slice(0, MAX_ROWS));
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [games]);

  return entries;
}
