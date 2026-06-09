import type { Winner } from '@/types';

interface WinnerTickerProps {
  winners: Winner[];
}

export function WinnerTicker({ winners }: WinnerTickerProps) {
  const items = [...winners, ...winners];

  return (
    <section className="overflow-hidden border-y border-white/5 bg-surface py-3">
      <div className="flex ticker-animate whitespace-nowrap">
        {items.map((winner, index) => (
          <span
            key={`${winner.id}-${index}`}
            className="mx-6 inline-flex items-center gap-2 text-sm text-muted"
          >
            <span className="text-accent-gold font-semibold">🏆 {winner.player}</span>
            won
            <span className="font-semibold text-white">
              {winner.currency} {winner.amount}
            </span>
            on
            <span className="text-accent">{winner.game}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
