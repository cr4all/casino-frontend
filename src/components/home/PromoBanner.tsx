import type { PromoBlock, Promotion } from '@/types';
import { useUiStore } from '@/stores/uiStore';
import { Button } from '@/components/common/Button';

interface PromoBannerProps {
  promotions: Promotion[];
}

export function PromoBannerGrid({ promotions }: PromoBannerProps) {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <section className="py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`rounded-lg bg-gradient-to-br ${promo.gradient} p-6 shadow-card`}
          >
            <h3 className="text-lg font-bold text-white">{promo.title}</h3>
            <p className="mt-2 text-sm text-white/80">{promo.subtitle}</p>
            <Button
              variant="secondary"
              className="mt-4 border-white/20"
              onClick={() => openModal('comingSoon', 'Promotions coming soon.')}
            >
              {promo.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

interface PromoBlocksProps {
  blocks: PromoBlock[];
}

export function PromoBlocks({ blocks }: PromoBlocksProps) {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <section className="py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {blocks.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => openModal('comingSoon', `${block.title} coming soon.`)}
            className={`rounded-lg bg-gradient-to-br ${block.gradient} p-6 text-left shadow-card hover:shadow-hover transition-shadow`}
          >
            <h3 className="text-base font-bold text-white">{block.title}</h3>
            <p className="mt-2 text-sm text-white/70">{block.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
