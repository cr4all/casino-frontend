import { useRef, type ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SectionTitle } from '@/components/common/SectionTitle';

interface HorizontalSliderProps {
  title: string;
  showAllPath?: string;
  children: ReactNode[];
  spaceBetween?: number;
  className?: string;
}

export function HorizontalSlider({
  title,
  showAllPath,
  children,
  spaceBetween = 12,
  className = '',
}: HorizontalSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className={`py-2 ${className}`}>
      <SectionTitle
        title={title}
        showAllPath={showAllPath}
        onPrev={() => swiperRef.current?.slidePrev()}
        onNext={() => swiperRef.current?.slideNext()}
      />
      <Swiper
        modules={[FreeMode]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        freeMode
        grabCursor
      >
        {children.map((child, index) => (
          <SwiperSlide key={index} className="!w-auto">
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
