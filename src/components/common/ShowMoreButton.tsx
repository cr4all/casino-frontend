import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface ShowMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  visible?: boolean;
}

export function ShowMoreButton({ onClick, loading = false, visible = true }: ShowMoreButtonProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className="flex justify-center pt-6">
      <Button
        type="button"
        variant="gold"
        onClick={onClick}
        disabled={loading}
        className="min-w-[200px] rounded-lg px-8 py-3 text-sm font-bold normal-case md:text-base"
      >
        {loading ? t('common.loading') : t('common.showMore')}
      </Button>
    </div>
  );
}
