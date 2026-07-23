import { useTranslation } from '@/hooks/useTranslation';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-accent-gold border border-accent-gold/30',
  requested: 'bg-yellow-500/15 text-accent-gold border border-accent-gold/30',
  confirmed: 'bg-green-500/15 text-green-400 border border-green-500/30',
  approved: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  processing: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
  cancelled: 'bg-white/5 text-muted border border-white/10',
  active: 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30',
  verified: 'bg-green-500/15 text-green-400 border border-green-500/30',
  suspended: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  closed: 'bg-white/5 text-muted border border-white/10',
  completed: 'bg-green-500/15 text-green-400 border border-green-500/30',
  paid: 'bg-green-500/15 text-green-400 border border-green-500/30',
  wagering: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20',
  won: 'bg-green-500/15 text-green-400 border border-green-500/30',
  lost: 'bg-red-500/15 text-red-400 border border-red-500/30',
  cashout: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { tStatus } = useTranslation();
  const style = statusStyles[status] ?? 'bg-surface text-muted border border-white/10';

  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {tStatus(status)}
    </span>
  );
}
