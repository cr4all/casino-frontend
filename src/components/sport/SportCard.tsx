import { motion } from 'framer-motion';
import type { SportCategory } from '@/types';
import { useUiStore } from '@/stores/uiStore';

interface SportCardProps {
  sport: SportCategory;
}

export function SportCard({ sport }: SportCardProps) {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <motion.button
      type="button"
      onClick={() => openModal('comingSoon', 'Sports betting is coming soon.')}
      className="group w-full text-left"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative flex h-36 flex-col items-center justify-center rounded-md bg-gradient-to-br ${sport.gradient} p-4 shadow-card group-hover:shadow-hover transition-shadow overflow-hidden`}
      >
        <span className="text-4xl mb-2">{sport.icon}</span>
        <span className="text-sm font-bold text-white">{sport.name}</span>
        <span className="mt-1 text-xs text-white/70">{sport.eventCount} events</span>
      </div>
    </motion.button>
  );
}
