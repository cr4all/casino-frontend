import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProviderCardProps {
  id: number;
  name: string;
  gameCount: number;
  gradient: string;
  path: string;
}

export function ProviderCard({ name, gameCount, gradient, path }: ProviderCardProps) {
  return (
    <Link to={path} className="group block w-full text-left">
      <motion.div
        className={`flex h-24 flex-col items-center justify-center rounded-md bg-gradient-to-br ${gradient} p-4 shadow-card group-hover:shadow-hover transition-shadow`}
        whileHover={{ scale: 1.02, y: -3 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-sm font-bold text-white text-center">{name}</span>
        <span className="mt-1 text-xs text-white/70">{gameCount} games</span>
      </motion.div>
    </Link>
  );
}

interface ProviderStripProps {
  vendors: { id: number; name: string; path: string }[];
}

export function ProviderStrip({ vendors }: ProviderStripProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {vendors.map((vendor) => (
        <Link
          key={vendor.id}
          to={vendor.path}
          className="rounded-full border border-white/10 bg-card px-4 py-2 text-xs font-medium text-white hover:border-accent/50 hover:bg-surface transition-colors"
        >
          {vendor.name}
        </Link>
      ))}
    </div>
  );
}
