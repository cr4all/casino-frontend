import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { GameVendor } from '@/api/game.api';
import { SectionTitle } from '@/components/common/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { getVendorLogoUrl } from '@/data/providerBanners';
import { providersPath } from '@/stores/gameStore';

interface ProviderCarouselProps {
  vendors: GameVendor[];
  loading?: boolean;
  selectedVendorId: number | null;
  onSelectVendor: (vendorId: number | null) => void;
}

function ProviderLogoTile({
  vendor,
  isActive,
  onSelect,
}: {
  vendor: GameVendor;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getVendorLogoUrl(vendor);
  const showLogo = logoUrl && !imgError;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={vendor.name}
      className="block shrink-0 p-0"
    >
      <div
        className={`flex h-[42px] w-[117px] items-center justify-center overflow-hidden rounded-md border transition-colors ${
          isActive ? 'border-accent-gold' : 'border-transparent hover:border-accent-gold/40'
        }`}
      >
        {showLogo ? (
          <img
            src={logoUrl}
            alt={vendor.name}
            className="h-full w-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="line-clamp-2 px-1 text-center text-[10px] font-bold leading-tight text-white">
            {vendor.name}
          </span>
        )}
      </div>
    </button>
  );
}

export function ProviderCarousel({
  vendors,
  loading,
  selectedVendorId,
  onSelectVendor,
}: ProviderCarouselProps) {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);
  const isAllActive = selectedVendorId === null;

  if (loading) {
    return (
      <section className="rounded-lg border border-white/[0.08] bg-card/50 px-4 py-3">
        <p className="text-xs text-muted">{t('common.loadingGames')}</p>
      </section>
    );
  }

  if (vendors.length === 0) return null;

  return (
    <section>
      <SectionTitle
        title={t('home.browseByProvider')}
        showAllPath={providersPath()}
        onPrev={() => swiperRef.current?.slidePrev()}
        onNext={() => swiperRef.current?.slideNext()}
      />
      <Swiper
        modules={[FreeMode]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView="auto"
        spaceBetween={10}
        freeMode
        grabCursor
      >
        <SwiperSlide className="!w-auto">
          <button
            type="button"
            onClick={() => onSelectVendor(null)}
            className={`flex h-[42px] w-[72px] items-center justify-center rounded-md border px-2 text-center text-[10px] font-bold leading-tight transition-colors ${
              isAllActive
                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                : 'border-white/10 bg-card text-white hover:border-accent-gold/30'
            }`}
          >
            {t('category.allGames')}
          </button>
        </SwiperSlide>
        {vendors.map((vendor) => (
          <SwiperSlide key={vendor.id} className="!w-auto">
            <ProviderLogoTile
              vendor={vendor}
              isActive={selectedVendorId === vendor.id}
              onSelect={() => onSelectVendor(vendor.id)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
