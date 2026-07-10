import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { heroBanners } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/common/Button';

export function HeroSlider() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className="py-4">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="rounded-lg overflow-hidden"
      >
        {heroBanners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className={`relative flex min-h-[200px] md:min-h-[320px] items-center bg-gradient-to-r ${banner.gradient} px-6 py-10 md:px-12 md:py-16`}
            >
              <div className="relative z-10 max-w-lg">
                <h1 className="text-2xl font-bold text-white md:text-4xl leading-tight">
                  {banner.title}
                </h1>
                <p className="mt-3 text-sm text-white/80 md:text-base">{banner.subtitle}</p>
                {banner.id === 'hero-1' ? (
                  isAuthenticated ? (
                    <Link to="/deposit">
                      <Button variant="gold" className="mt-6">{banner.cta}</Button>
                    </Link>
                  ) : (
                    <Link to="/bonus">
                      <Button variant="gold" className="mt-6">{banner.cta}</Button>
                    </Link>
                  )
                ) : banner.id === 'hero-3' ? (
                  <Link to="/bonus">
                    <Button variant="gold" className="mt-6">{banner.cta}</Button>
                  </Link>
                ) : (
                  <Link to="/category/slots">
                    <Button variant="gold" className="mt-6">{banner.cta}</Button>
                  </Link>
                )}
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
