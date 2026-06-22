import { useMemo, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import type { Game } from '@/types';
import { useLiveBetFeed } from '@/hooks/useLiveBetFeed';
import { useTranslation } from '@/hooks/useTranslation';
import { getGameThumbnailUrl } from '@/data/gameThumbnails';
import { formatUsd, maskUsername, type LiveBetEntry } from '@/utils/liveBetFeed';

interface LiveBetFeedProps {
  games: Game[];
}

function GameThumb({ game }: { game: Game }) {
  const [failed, setFailed] = useState(false);
  const src = useMemo(() => getGameThumbnailUrl(game), [game]);

  if (!src || failed) {
    return (
      <span className="live-bet-feed__game-fallback" aria-hidden="true">
        🎮
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="live-bet-feed__game-thumb"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

function LiveBetRow({ entry, hiddenLabel }: { entry: LiveBetEntry; hiddenLabel: string }) {
  const timeLabel = entry.time.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={entry.isMegaWin ? 'live-bet-feed__row live-bet-feed__row--mega' : 'live-bet-feed__row'}
    >
      <td className="live-bet-feed__cell live-bet-feed__cell--game">
        <div className="live-bet-feed__game">
          <GameThumb game={entry.game} />
          <span className="live-bet-feed__game-name">{entry.game.name}</span>
        </div>
      </td>
      <td className="live-bet-feed__cell live-bet-feed__cell--user">
        {entry.userHidden ? (
          <span className="live-bet-feed__hidden">
            <span className="live-bet-feed__hidden-icon" aria-hidden="true">🕶️</span>
            {hiddenLabel}
          </span>
        ) : (
          <span className="live-bet-feed__username">{maskUsername(entry.username)}</span>
        )}
      </td>
      <td className="live-bet-feed__cell live-bet-feed__cell--time">{timeLabel}</td>
      <td className="live-bet-feed__cell live-bet-feed__cell--amount">
        <span className="live-bet-feed__money">{formatUsd(entry.betAmount)}</span>
      </td>
      <td className="live-bet-feed__cell live-bet-feed__cell--multiplier">
        <span className={entry.isMegaWin ? 'live-bet-feed__multiplier live-bet-feed__multiplier--mega' : undefined}>
          {formatMultiplier(entry.multiplier)}
        </span>
      </td>
      <td className="live-bet-feed__cell live-bet-feed__cell--payout">
        <span
          className={
            entry.isMegaWin
              ? 'live-bet-feed__payout live-bet-feed__payout--mega'
              : entry.isWin
                ? 'live-bet-feed__payout live-bet-feed__payout--win'
                : 'live-bet-feed__payout live-bet-feed__payout--loss'
          }
        >
          {entry.isWin ? formatUsd(entry.payout) : `-${formatUsd(entry.betAmount)}`}
        </span>
      </td>
    </motion.tr>
  );
}

export function LiveBetFeed({ games }: LiveBetFeedProps) {
  const { t } = useTranslation();
  const entries = useLiveBetFeed(games);

  if (games.length === 0 || entries.length === 0) {
    return null;
  }

  return (
    <section className="live-bet-feed" aria-label={t('liveBetFeed.title')}>
      <div className="live-bet-feed__table-wrap">
        <table className="live-bet-feed__table">
          <thead>
            <tr>
              <th>{t('liveBetFeed.game')}</th>
              <th>{t('liveBetFeed.user')}</th>
              <th>{t('liveBetFeed.time')}</th>
              <th>{t('liveBetFeed.betAmount')}</th>
              <th>{t('liveBetFeed.multiplier')}</th>
              <th>{t('liveBetFeed.payout')}</th>
            </tr>
          </thead>
          <LayoutGroup>
            <tbody className="live-bet-feed__tbody">
              {entries.map((entry) => (
                <LiveBetRow key={entry.id} entry={entry} hiddenLabel={t('liveBetFeed.hidden')} />
              ))}
            </tbody>
          </LayoutGroup>
        </table>
      </div>
    </section>
  );
}
