import type { ReactNode } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTranslation } from '@/hooks/useTranslation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: ReactNode;
  size?: 'md' | 'xl';
  children: ReactNode;
}

const panelSizeClass: Record<NonNullable<ModalProps['size']>, string> = {
  md: 'max-w-md',
  xl: 'max-w-3xl',
};

export function Modal({ isOpen, onClose, title, titleIcon, size = 'md', children }: ModalProps) {
  const { t } = useTranslation();
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          className={`relative z-10 w-full ${panelSizeClass[size]} max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/[0.08] bg-card p-6 shadow-card`}
        >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {titleIcon}
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface hover:text-white transition-colors"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>
        {children}
        </div>
      </div>
    </div>
  );
}

export function ComingSoonModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const message = useUiStore((s) => s.comingSoonMessage);
  const closeModal = useUiStore((s) => s.closeModal);

  return (
    <Modal isOpen={activeModal === 'comingSoon'} onClose={closeModal} title={t('modal.comingSoon')}>
      <p className="text-muted mb-6">{message}</p>
      <button
        type="button"
        onClick={closeModal}
        className="w-full rounded-lg bg-accent-gold py-2.5 text-sm font-bold text-background hover:bg-accent-gold/90 transition-colors"
      >
        {t('common.ok')}
      </button>
    </Modal>
  );
}
