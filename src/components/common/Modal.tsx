import type { ReactNode } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from '@/hooks/useTranslation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-white/[0.08] bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
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
