import type { SportEvent } from '@/types';
import { useUiStore } from '@/stores/uiStore';

interface EventCardProps {
  event: SportEvent;
}

export function EventCard({ event }: EventCardProps) {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <div className="rounded-md bg-card p-4 shadow-card border border-white/5 min-w-[260px]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-accent">{event.league}</span>
        <span className="text-xs text-muted">{event.startTime}</span>
      </div>
      <div className="mb-4 space-y-1">
        <p className="text-sm font-semibold text-white">{event.homeTeam}</p>
        <p className="text-xs text-muted">vs</p>
        <p className="text-sm font-semibold text-white">{event.awayTeam}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => openModal('comingSoon', 'Sports betting is coming soon.')}
          className="flex-1 rounded-sm bg-surface py-2 text-center text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
        >
          {event.homeOdds}
        </button>
        {event.drawOdds && (
          <button
            type="button"
            onClick={() => openModal('comingSoon', 'Sports betting is coming soon.')}
            className="flex-1 rounded-sm bg-surface py-2 text-center text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
          >
            {event.drawOdds}
          </button>
        )}
        <button
          type="button"
          onClick={() => openModal('comingSoon', 'Sports betting is coming soon.')}
          className="flex-1 rounded-sm bg-surface py-2 text-center text-xs font-medium text-white hover:bg-accent/20 hover:text-accent transition-colors"
        >
          {event.awayOdds}
        </button>
      </div>
    </div>
  );
}
