import { create } from 'zustand';

type ModalType = 'login' | 'register' | 'comingSoon' | null;

interface UiState {
  activeModal: ModalType;
  comingSoonMessage: string;
  openModal: (modal: ModalType, message?: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  comingSoonMessage: 'This feature is coming soon.',

  openModal: (modal, message) =>
    set({
      activeModal: modal,
      comingSoonMessage: message ?? 'This feature is coming soon.',
    }),

  closeModal: () => set({ activeModal: null }),
}));
