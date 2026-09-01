import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { formatVendorName } from '@/utils/formatVendorName';

interface ProviderCardProps {
  name: string;
  gameCount: number;
  imageUrl?: string | null;
  gradient: string;
  path: string;
}

export function ProviderCard({ name, gameCount, imageUrl, gradient, path }: ProviderCardProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const showImage = imageUrl && !imgError;

  return (
    <Link to={path} className="group block w-full text-left">
      <motion.div
        className={`relative h-28 overflow-hidden rounded-md shadow-card transition-shadow group-hover:shadow-hover ${
          showImage ? '' : `bg-gradient-to-br ${gradient}`
        }`}
        whileHover={{ scale: 1.02, y: -3 }}
        transition={{ duration: 0.2 }}
      >
        {showImage && (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        <div
          className={`absolute inset-0 ${
            showImage
              ? 'bg-gradient-to-t from-black/85 via-black/40 to-black/10'
              : 'bg-black/20'
          }`}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <p className="min-w-0 truncate text-sm font-bold text-white drop-shadow-md">
            {formatVendorName(name)}
          </p>
          <p className="shrink-0 text-sm font-bold text-white drop-shadow-md">
            {t('common.gamesCount', { count: gameCount })}
          </p>
        </div>
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
          className="rounded-full border border-white/10 bg-card px-4 py-2 text-xs font-medium text-white transition-colors hover:border-accent/50 hover:bg-surface"
        >
          {formatVendorName(vendor.name)}
        </Link>
      ))}
    </div>
  );
}
